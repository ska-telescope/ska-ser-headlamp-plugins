import { ApiProxy } from '@kinvolk/headlamp-plugin/lib';
import appConfig from './config';

const request = ApiProxy.request;

export async function isTangoPingInstalled() {
  const queryParams = new URLSearchParams();
  const labelSelector =
    appConfig.getConfig().skaTangoPingServiceLabelSelector ||
    'app.kubernetes.io/name=ska-tango-ping';
  queryParams.append('labelSelector', labelSelector);

  const response = await request(`/api/v1/services?${queryParams.toString()}`, {
    method: 'GET',
  });

  if (response.items && response.items.length > 0) {
    return [true, response.items[0].metadata.name, response.items[0].metadata.namespace];
  }

  return [false, null, null];
}
