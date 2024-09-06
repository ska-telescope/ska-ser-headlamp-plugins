import { K8s } from '@kinvolk/headlamp-plugin/lib';
import { generatePath } from 'react-router';

export interface RouteURLProps {
  cluster?: string;
  [prop: string]: any;
}

export function getRouteUrl(routePath: string, params: RouteURLProps = {}) {
  const cluster: string | null = K8s.useCluster();
  if (!cluster) {
    return '/';
  }

  const fullParams = {
    ...params,
  };
  if (!fullParams.cluster && !!cluster) {
    fullParams.cluster = cluster;
  }

  return generatePath(`#/c/:cluster${routePath}`, fullParams);
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
