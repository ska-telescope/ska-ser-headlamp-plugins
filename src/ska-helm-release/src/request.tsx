import { ApiProxy } from '@kinvolk/headlamp-plugin/lib';
import pako from 'pako';

const request = ApiProxy.request;

export interface HelmReleaseDependency {
  name: string;
  version: string;
  repository: string;
  latestVersion?: string;
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

function getLatestVersion(repository: string, chart: string, version: string) {
  return null;
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
    const releaseData: any[] = filteredSecretList.map(item => decodeReleaseData(item.data.release));
    releaseData.forEach(data => {
      console.log(data);
    });

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
            item =>
              ({
                name: item.name,
                version: item.version,
                repository: item.repository,
                enabled: item.enabled,
                latestVersion: getLatestVersion(item.repository, item.name, item.version),
              } as HelmReleaseDependency)
          ),
        } as HelmReleaseData)
    );
  } else {
    console.error(response.statusText);

    return [];
  }
}
