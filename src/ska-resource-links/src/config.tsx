import { ApiProxy } from '@kinvolk/headlamp-plugin/lib';
import YAML from 'yaml';

const request = ApiProxy.request;

class AppConfig {
  private clusterConfigMapLabel: string = '<CLUSTER_CONFIG_MAP_LABEL>';
  constructor() {
    this.clusterConfigMapLabel = this.clusterConfigMapLabel.match('<.*>')
      ? null
      : this.clusterConfigMapLabel;
  }

  // Function to get the configuration
  public getConfig() {
    return {
      clusterConfigMapLabel: this.clusterConfigMapLabel,
    };
  }
}

export type ResourceLinkType = 'monitoring' | 'logging';

export interface ResourceLinkConfig {
  defaultTimeframe: string;
  kindUrls?: Record<string, string>;
}

export interface ResourceLinksConfig {
  monitoring: ResourceLinkConfig;
  logging: ResourceLinkConfig;
}

export const supportedKinds = [
  'Namespace',
  'Pod',
  'StatefulSet',
  'DaemonSet',
  'Deployment',
  'ReplicaSet',
  'Job',
];

const kindLoggingFilterMap = {
  Namespace: 'kubernetes.namespace',
  Pod: 'kubernetes.pod.name',
  StatefulSet: 'kubernetes.statefulset.name',
  DaemonSet: 'kubernetes.daemonset.name',
  ReplicaSet: 'kubernetes.replicaset.name',
  Deployment: 'kubernetes.replicaset.name',
  Job: 'kubernetes.job.name',
};

export function getKindFilter(type: ResourceLinkType, kind: string) {
  if (type === 'logging') {
    return kindLoggingFilterMap[kind];
  }

  return kind;
}

async function getConfig() {
  const queryParams = new URLSearchParams();
  const labelSelector = new AppConfig().getConfig().clusterConfigMapLabel || 'headlamp/config';
  queryParams.append('labelSelector', labelSelector);
  const response = await request(`/api/v1/configmaps?${queryParams.toString()}`, {
    method: 'GET',
  });

  if (response.items && response.items.length > 0) {
    return (YAML.parse(response.items.at(0)?.data?.config) as ResourceLinksConfig) || null;
  }

  return null;
}

export default getConfig;
