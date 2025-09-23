import { DetailsViewSectionProps } from '@kinvolk/headlamp-plugin/lib';
import { DiskMetricsChart } from '../components/Chart/DiskMetricsChart/DiskMetricsChart';
import { GenericMetricsChart } from '../components/Chart/GenericMetricsChart/GenericMetricsChart';
import { KarpenterChart } from '../components/Chart/KarpenterChart/KarpenterChart';
import { KedaChart } from '../components/Chart/KedaChart/KedaChart';
import { getNodeClaimChartConfigs, getNodePoolChartConfigs } from '../util';
import appConfig from './config';

export function SKAOPrometheusMetrics(resource: DetailsViewSectionProps) {
  const PROMETHEUS_DATACENTRE_LABEL = appConfig.getConfig().prometheusDatacentreLabel || null;
  const datacentreLabel = PROMETHEUS_DATACENTRE_LABEL
    ? `datacentre='${PROMETHEUS_DATACENTRE_LABEL}',`
    : '';

  if (resource.kind === 'Pod' || resource.kind === 'Job' || resource.kind === 'CronJob') {
    return (
      <GenericMetricsChart
        cpuQuery={`sum(rate(container_cpu_usage_seconds_total{${datacentreLabel}container!='',namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}.*'}[1m])) by (pod,namespace)`}
        memoryQuery={`sum(container_memory_working_set_bytes{${datacentreLabel}namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}.*'}) by (pod,namespace)`}
        networkRxQuery={`sum(rate(container_network_receive_bytes_total{${datacentreLabel}namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}.*'}[1m])) by (pod,namespace)`}
        networkTxQuery={`sum(rate(container_network_transmit_bytes_total{${datacentreLabel}namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}.*'}[1m])) by (pod,namespace)`}
        filesystemReadQuery={`sum(rate(container_fs_reads_bytes_total{${datacentreLabel}namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}.*'}[1m])) by (pod,namespace)`}
        filesystemWriteQuery={`sum(rate(container_fs_writes_bytes_total{${datacentreLabel}namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}.*'}[1m])) by (pod,namespace)`}
      />
    );
  }

  if (
    resource.kind === 'Deployment' ||
    resource.kind === 'StatefulSet' ||
    resource.kind === 'DaemonSet' ||
    resource.kind === 'ReplicaSet'
  ) {
    return (
      <GenericMetricsChart
        cpuQuery={`sum(rate(container_cpu_usage_seconds_total{${datacentreLabel}container!='',namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}-.*'}[1m])) by (pod,namespace)`}
        memoryQuery={`sum(container_memory_working_set_bytes{${datacentreLabel}namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}-.*'}) by (pod,namespace)`}
        networkRxQuery={`sum(rate(container_network_receive_bytes_total{${datacentreLabel}namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}-.*'}[1m])) by (pod,namespace)`}
        networkTxQuery={`sum(rate(container_network_transmit_bytes_total{${datacentreLabel}namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}-.*'}[1m])) by (pod,namespace)`}
        filesystemReadQuery={`sum(rate(container_fs_reads_bytes_total{${datacentreLabel}namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}-.*'}[1m])) by (pod,namespace)`}
        filesystemWriteQuery={`sum(rate(container_fs_writes_bytes_total{${datacentreLabel}namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}-.*'}[1m])) by (pod,namespace)`}
      />
    );
  }

  if (resource.kind === 'Namespace') {
    return (
      <GenericMetricsChart
        cpuQuery={`sum(rate(container_cpu_usage_seconds_total{${datacentreLabel}container!='',namespace='${resource.jsonData.metadata.name}'}[1m])) by (namespace)`}
        memoryQuery={`sum(container_memory_working_set_bytes{${datacentreLabel}namespace='${resource.jsonData.metadata.name}'}) by (namespace)`}
        networkRxQuery={`sum(rate(container_network_receive_bytes_total{${datacentreLabel}namespace='${resource.jsonData.metadata.name}'}[1m])) by (namespace)`}
        networkTxQuery={`sum(rate(container_network_transmit_bytes_total{${datacentreLabel}namespace='${resource.jsonData.metadata.name}'}[1m])) by (namespace)`}
        filesystemReadQuery={`sum(rate(container_fs_reads_bytes_total{${datacentreLabel}namespace='${resource.jsonData.metadata.name}'}[1m])) by (namespace)`}
        filesystemWriteQuery={`sum(rate(container_fs_writes_bytes_total{${datacentreLabel}namespace='${resource.jsonData.metadata.name}'}[1m])) by (namespace)`}
      />
    );
  }

  if (resource.kind === 'PersistentVolumeClaim') {
    return (
      <DiskMetricsChart
        usageQuery={`sum(kubelet_volume_stats_used_bytes{${datacentreLabel}namespace='${resource.jsonData.metadata.namespace}',persistentvolumeclaim='${resource.jsonData.metadata.name}'}) by (persistentvolumeclaim, namespace)`}
        capacityQuery={`sum(kubelet_volume_stats_capacity_bytes{${datacentreLabel}namespace='${resource.jsonData.metadata.namespace}',persistentvolumeclaim='${resource.jsonData.metadata.name}'}) by (persistentvolumeclaim, namespace)`}
      />
    );
  }

  if (resource.kind === 'ScaledObject') {
    const namespace = resource.jsonData.metadata.namespace;
    const name = resource.jsonData.metadata.name;
    const hpaName = resource.jsonData.status.hpaName;
    const defaultMinReplicaCount = 0; // https://keda.sh/docs/latest/reference/scaledobject-spec/#minreplicacount
    const defaultMaxReplicaCount = 100; // https://keda.sh/docs/latest/reference/scaledobject-spec/#maxreplicacount

    return (
      <KedaChart
        scalerMetricsQuery={`keda_scaler_metrics_value{exported_namespace='${namespace}',scaledObject='${name}',type='scaledobject'}`}
        hpaReplicasQuery={`kube_horizontalpodautoscaler_status_current_replicas{namespace='${namespace}',horizontalpodautoscaler='${hpaName}'}`}
        minReplicaCount={resource.jsonData.spec.minReplicaCount ?? defaultMinReplicaCount}
        maxReplicaCount={resource.jsonData.spec.maxReplicaCount ?? defaultMaxReplicaCount}
      />
    );
  }

  if (resource.kind === 'ScaledJob') {
    const namespace = resource.jsonData.metadata.namespace;
    const name = resource.jsonData.metadata.name;
    const defaultMinReplicaCount = 0; // https://keda.sh/docs/latest/reference/scaledjob-spec/#minreplicacount
    const defaultMaxReplicaCount = 100; // https://keda.sh/docs/latest/reference/scaledjob-spec/#maxreplicacount

    return (
      <KedaChart
        scalerMetricsQuery={`keda_scaler_metrics_value{exported_namespace='${namespace}',scaledObject='${name}',type='scaledjob'}`}
        activeJobsQuery={`sum(kube_job_status_active{namespace='${namespace}',job_name=~"${name}-.*"})`}
        minReplicaCount={resource.jsonData.spec.minReplicaCount ?? defaultMinReplicaCount}
        maxReplicaCount={resource.jsonData.spec.maxReplicaCount ?? defaultMaxReplicaCount}
      />
    );
  }

  if (resource.kind === 'NodePool') {
    const name = resource.jsonData.metadata.name;

    return <KarpenterChart chartConfigs={getNodePoolChartConfigs(name)} defaultChart="usage" />;
  }

  if (resource.kind === 'NodeClaim') {
    const name = resource.jsonData.metadata.name;

    const nodepool = resource.jsonData.metadata.labels['karpenter.sh/nodepool'];

    return (
      <KarpenterChart
        chartConfigs={getNodeClaimChartConfigs(name, nodepool)}
        defaultChart="creation-rate"
      />
    );
  }
}
