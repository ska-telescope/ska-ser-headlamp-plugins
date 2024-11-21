import { ApiProxy } from '@kinvolk/headlamp-plugin/lib';

const request = ApiProxy.request;

export interface TangoPingService {
  serviceName: string;
  serviceNamespace: string;
}
