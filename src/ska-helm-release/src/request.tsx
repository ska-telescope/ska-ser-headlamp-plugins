import { ApiProxy } from '@kinvolk/headlamp-plugin/lib';
import pako from 'pako';
import semver from 'semver';
import appConfig from './config';
import getLatestHelmChartReleaseFromCAR, { CarProxy } from './nexus';

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
  error: string | null;
  latestVersion: string | null;
  hasVersionInfo: boolean;
}

export interface HelmReleaseData {
  name: string;
  version: string;
  status: string;
  timestamp: string;
  chart: string;
  chartVersion: string;
  chartDependencies: string;
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

function compareVersions(versionA: string, versionB: string): string | null {
  if (!versionB || semver.gte(versionA, versionB)) {
    return null;
  }

  return versionB;
}

async function getLatestVersion(repository: string, chart: string, carProxy: CarProxy) {
  if (!repository || !repository.startsWith('https://artefact.skao.int')) {
    return [null, null];
  }

  return await getLatestHelmChartReleaseFromCAR(repository.split('/').pop(), chart, carProxy);
}

export async function fetchHelmReleases(
  namespace: string,
  carProxy: CarProxy | null
): Promise<HelmReleaseData[]> {
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
    const releaseData: any[] = filteredSecretList.map(item => decodeReleaseData(item.data.release));
    const latestVersions: any[] = await Promise.all(
      releaseData.map(async item => {
        if (!item.chart.metadata.dependencies || !carProxy) {
          return {};
        }

        return item.chart.metadata.dependencies.reduce(async (accPromise, dep) => {
          const acc = await accPromise;
          const [error, latestVersion] = await getLatestVersion(dep.repository, dep.name, carProxy);
          acc[dep.name] = {
            error: error,
            latestVersion: compareVersions(dep.version, latestVersion),
            hasVersionInfo: latestVersion !== undefined && latestVersion !== null,
          };
          return acc;
        }, Promise.resolve({} as Record<string, string>));
      })
    );

    return filteredSecretList.map(
      (item, idx) =>
        ({
          name: item.metadata.labels.name,
          version: item.metadata.labels.version,
          status: item.metadata.labels.status,
          timestamp: item.metadata.creationTimestamp,
          chart: releaseData[idx].chart.metadata.name,
          chartVersion: releaseData[idx].chart.metadata.version,
          appVersion: releaseData[idx].chart.metadata.appVersion,
          chartDependencies: releaseData[idx].chart.metadata.dependencies?.map(
            dep =>
              ({
                name: dep.name,
                version: dep.version,
                repository: dep.repository,
                enabled: dep.enabled,
                ...latestVersions[idx][dep.name],
              } as HelmReleaseDependency)
          ),
        } as HelmReleaseData)
    );
  } else {
    console.error(response.statusText);

    return [];
  }
}
