import {
  DefaultDetailsViewSection,
  DetailsViewSectionProps,
  registerDetailsViewHeaderActionsProcessor,
  registerDetailsViewSectionsProcessor,
} from '@kinvolk/headlamp-plugin/lib';
import { DiskMetricsChart, GenericMetricsChart } from './common';
import appConfig from './config';
import { ChartEnabledKinds } from './util';
import VisibilityButton from './VisibilityButton';

function PrometheusMetrics(resource: DetailsViewSectionProps) {
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
}

registerDetailsViewSectionsProcessor(function addSubheaderSection(resource, sections) {
  // Ignore if there is no resource.
  if (!resource) {
    return sections;
  }

  const prometheusSection = 'prom_metrics';
  if (sections.findIndex(section => section.id === prometheusSection) !== -1) {
    return sections;
  }

  const mainIdx = sections.findIndex(
    section => section.id === DefaultDetailsViewSection.MAIN_HEADER
  );
  // There is no header, so we do nothing.
  if (mainIdx === -1) {
    return sections;
  }

  // We place our custom section after the header.
  sections.splice(mainIdx + 1, 0, {
    id: prometheusSection,
    section: PrometheusMetrics(resource),
  });

  return sections;
});

registerDetailsViewHeaderActionsProcessor(function addPrometheusMetricsButton(resource, actions) {
  // Ignore if there is no resource.
  if (!resource) {
    return actions;
  }

  const prometheusAction = 'prom_metrics';
  // If the action is already there, we do nothing.
  if (actions.findIndex(action => action.id === prometheusAction) !== -1) {
    return actions;
  }

  // If the action is not supposed to be added, we do nothing.
  if (!ChartEnabledKinds.includes(resource?.jsonData?.kind)) {
    return actions;
  }

  actions.splice(0, 0, {
    id: prometheusAction,
    action: <VisibilityButton resource={resource} />,
  });

  return actions;
});
