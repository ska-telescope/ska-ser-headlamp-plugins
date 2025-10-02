import { ApiProxy } from '@kinvolk/headlamp-plugin/lib';
import pako from 'pako';
import appConfig from './config';
import getLatestHelmChartReleaseFromCAR, { CarProxy, ChartLatestVersionInfo } from './nexus';

const request = ApiProxy.request;

export async function isCARProxyInstalled() {
  const queryParams = new URLSearchParams();
  const labelSelector =
    appConfig.getConfig().carProxyServiceLabelSelector ||
    'app.kubernetes.io/name=headlamp-car-proxy';
  queryParams.append('labelSelector', labelSelector);

  const response = await request(`/api/v1/services?${queryParams.toString()}`, {
    method: 'GET',
  });

  if (response.items && response.items.length > 0) {
    return [true, response.items[0].metadata.name, response.items[0].metadata.namespace];
  }

  return [false, null, null];
}

export interface HelmReleaseDependency {
  name: string;
  version: string;
  repository: string;
  enabled: boolean;
  indirect: boolean;
  local: boolean;
  external: boolean;
  latestVersionInfo?: ChartLatestVersionInfo;
}

export interface HelmReleaseData {
  name: string;
  version: string;
  status: string;
  timestamp: string;
  updatedTimestamp: string;
  chart: string;
  chartVersion: string;
  appVersion: string;
  dependencies?: HelmReleaseDependency[];
}

function decodeReleaseData(encodedData: string) {
  try {
    const b64Data = atob(atob(encodedData));
    const decodedData = pako.ungzip(new Uint8Array([...b64Data].map(char => char.charCodeAt(0))), {
      to: 'string',
    });
    return JSON.parse(decodedData);
  } catch (error) {
    console.error('Error decompressing Gzip data:', error);
    return null;
  }
}

export async function fetchLatestVersionInfo(
  repository: string,
  chart: string,
  carProxy: CarProxy
) {
  if (!repository || !repository.startsWith('https://artefact.skao.int')) {
    return null;
  }

  return await getLatestHelmChartReleaseFromCAR(repository.split('/').pop(), chart, carProxy);
}

export async function fetchHelmReleases(namespace: string): Promise<HelmReleaseData[]> {
  const params = new URLSearchParams();
  params.append('labelSelector', 'owner=helm');
  const response = await request(`/api/v1/namespaces/${namespace}/secrets?${params.toString()}`, {
    method: 'GET',
    isJSON: false,
  });

  if (response.status === 200) {
    const secretList: any = await response.json();
    const filteredSecretList = secretList.items.filter(
      item => ['deployed', 'failed'].indexOf(item.metadata.labels.status) > -1
    );

    return filteredSecretList.map(item => {
      const decodedData = decodeReleaseData(item.data.release);
      const metadataDeps = decodedData.chart.metadata.dependencies || [];
      const lockDeps = decodedData.chart.lock?.dependencies || [];
      const depMap = new Map<string, HelmReleaseDependency>();

      metadataDeps.forEach(metaDep => {
        let depToAdd: HelmReleaseDependency = metaDep;
        if (metaDep.alias) {
          const matchingLockDep = lockDeps.find(
            lockDep =>
              lockDep.version === metaDep.version &&
              lockDep.repository === metaDep.repository &&
              lockDep.name.includes(metaDep.name)
          );

          if (matchingLockDep) {
            depToAdd = matchingLockDep;
          }
        }

        const key = `${depToAdd.repository || ''}:${depToAdd.name}:${depToAdd.version}`;
        depToAdd.local = depToAdd.repository.startsWith('file://');
        depToAdd.external =
          !depToAdd.repository.startsWith('https://artefact.skao.int') &&
          !depToAdd.repository.startsWith('https://harbor.skao.int');
        depMap.set(key, depToAdd);
      });

      lockDeps.forEach(lockDep => {
        const key = `${lockDep.repository || ''}:${lockDep.name}:${lockDep.version}`;
        if (!depMap.has(key)) {
          const indirectDep = { ...lockDep, indirect: true };
          depMap.set(key, indirectDep);
        }
      });

      return {
        name: item.metadata.labels.name,
        version: item.metadata.labels.version,
        status: item.metadata.labels.status,
        timestamp: decodedData.info.first_deployed,
        updatedTimestamp: decodedData.info.last_deployed || decodedData.info.first_deployed,
        chart: decodedData.chart.metadata.name,
        chartVersion: decodedData.chart.metadata.version,
        appVersion: decodedData.chart.metadata.appVersion,
        dependencies: Array.from(depMap.values()),
      } as HelmReleaseData;
    });
  } else {
    console.error(response.statusText);
    return [];
  }
}
