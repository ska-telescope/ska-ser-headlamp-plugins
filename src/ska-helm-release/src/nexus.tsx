import { ApiProxy } from '@kinvolk/headlamp-plugin/lib';

const request = ApiProxy.request;

interface ChartVersion {
  name: string;
  version: string;
}

export interface CarProxy {
  serviceName: string;
  serviceNamespace: string;
}

export interface ChartLatestVersionInfo {
  version: string | null;
  resolved: boolean;
  error: string | null;
}

export default async function getLatestHelmChartReleaseFromCAR(
  repository: string,
  chart: string,
  carProxy: CarProxy
): Promise<ChartLatestVersionInfo> {
  const params = new URLSearchParams({
    repository: repository,
    name: chart,
    sort: 'version',
    direction: 'desc',
  });

  const response = await request(
    `/api/v1/namespaces/${carProxy.serviceNamespace}/services/${
      carProxy.serviceName
    }/proxy/service/rest/v1/search?${params.toString()}`,
    {
      method: 'GET',
      isJSON: false,
    }
  );

  if (response.status === 200) {
    const jsonData = await response.json();
    const items = jsonData.items as ChartVersion[];
    let filteredItems = items;
    if (items && items.length > 0) {
      // Filter out versions RC versions
      filteredItems = items.filter(item => !item.version.match('.*(.|-)rc(.|-|$)($|[0-9]+$)'));
    }

    if (filteredItems && filteredItems.length > 0) {
      return {
        version: filteredItems[0].version,
        error: null,
        resolved: true,
      } as ChartLatestVersionInfo;
    }

    const error = `Couldn't find version information for chart '${chart}'`;
    console.warn(error);
    return {
      version: null,
      error: error,
      resolved: true,
    } as ChartLatestVersionInfo;
  }

  return {
    version: null,
    error: response.statusText,
    resolved: true,
  } as ChartLatestVersionInfo;
}
