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

export default async function getLatestHelmChartReleaseFromCAR(
  repository: string,
  chart: string,
  carProxy: CarProxy
): Promise<[string, string]> {
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
    if (items && items.length > 0) {
      return [null, items[0].version];
    } else {
      const error = `Couldn't find version information for chart '${chart}'`;
      console.warn(error);
      return [error, null];
    }
  } else {
    return [response.statusText, null];
  }
}
