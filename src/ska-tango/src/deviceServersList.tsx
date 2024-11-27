import { K8s } from '@kinvolk/headlamp-plugin/lib';
import {
  Loader,
  SectionBox,
  SectionFilterHeader,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { KubeCRD } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';
import { useFilterFunc } from '@kinvolk/headlamp-plugin/lib/Utils';
import { useMemo } from 'react';
import Table from './common/Table';
import TangoDetectionWrapper from './tango';

export default function DeviceServers() {
  return (
    <TangoDetectionWrapper omit={false}>
      <DeviceServersListWrapper namespace={null} />
    </TangoDetectionWrapper>
  );
}

export function DeviceServersListWrapper({ namespace }) {
  const [deviceServers] = K8s.ResourceClasses.CustomResourceDefinition.useGet(
    'deviceservers.tango.tango-controls.org'
  );

  const deviceServersResourceClass = useMemo(() => {
    return deviceServers?.makeCRClass();
  }, [deviceServers]);

  return <DeviceServersList resourceClass={deviceServersResourceClass} namespace={namespace} />;
}

interface DeviceServersListProps {
  resourceClass: KubeCRD;
  namespace?: K8s.ResourceClasses.Namespace;
  hideWithoutItems?: boolean;
  paddingTop?: number;
}

export function DeviceServersList(props: DeviceServersListProps) {
  const queryData = {
    namespace: props?.namespace?.metadata.name || null,
  };

  let filteredDeviceServers;
  let deviceServers = [];
  if (props.resourceClass) {
    [deviceServers] = props.resourceClass.useList(queryData);
    filteredDeviceServers = deviceServers;
  }

  // This shouldn't be needed, but useList is not filtering properly
  if (deviceServers && props.namespace) {
    filteredDeviceServers = deviceServers.filter(
      item => item.jsonData.metadata.namespace === props.namespace.metadata.name
    );
  }

  const namespacedColumns = ['name', 'devices', 'status', 'statefulset', 'age', 'config'];
  const generalColumns = ['name', 'namespace', 'devices', 'status', 'statefulset', 'age', 'config'];

  if (
    !props ||
    (props?.hideWithoutItems &&
      (filteredDeviceServers === undefined || filteredDeviceServers?.length === 0))
  ) {
    return <></>;
  }

  return (
    <SectionBox
      title={<SectionFilterHeader title="Device Servers" noNamespaceFilter={props?.namespace} />}
    >
      {props.resourceClass ? (
        <Table
          data={filteredDeviceServers}
          defaultSortingColumn={1}
          filterFunction={props.namespace ? null : useFilterFunc()}
          columns={props.namespace ? namespacedColumns : generalColumns}
        />
      ) : (
        <Loader />
      )}
    </SectionBox>
  );
}
