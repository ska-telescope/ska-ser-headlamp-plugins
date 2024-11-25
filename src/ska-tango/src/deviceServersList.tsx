import { K8s } from '@kinvolk/headlamp-plugin/lib';
import {
  Loader,
  SectionBox,
  SectionFilterHeader,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { KubeCRD } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';
import { useFilterFunc } from '@kinvolk/headlamp-plugin/lib/Utils';
import React, { useEffect, useState } from 'react';
import Table from './common/Table';
import TangoNotInstalled from './common/TangoNotInstalled';
import { isTangoPingInstalled } from './request';

export default function DeviceServers() {
  const [loading, setLoading] = useState<boolean>(true);
  const [tangoPingInfo, setTangoPingInfo] = useState<{
    serviceName: string;
    serviceNamespace: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [isInstalled, serviceName, namespace] = await isTangoPingInstalled();
        if (isInstalled) {
          setTangoPingInfo({ serviceName, serviceNamespace: namespace });
          setLoading(false);
        } else {
          setTangoPingInfo(null);
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
        return;
      }
    })();
  }, []);

  if (!loading && !tangoPingInfo) {
    return <TangoNotInstalled />;
  }

  return <DeviceServersListWrapper namespace={null} />;
}

export function DeviceServersListWrapper({ namespace }) {
  const [deviceServers] = K8s.ResourceClasses.CustomResourceDefinition.useGet(
    'deviceservers.tango.tango-controls.org'
  );

  const deviceServersResourceClass = React.useMemo(() => {
    return deviceServers?.makeCRClass();
  }, [deviceServers]);

  return (
    <div>
      <DeviceServersList resourceClass={deviceServersResourceClass} namespace={namespace} />
    </div>
  );
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

  let resource = [];
  if (props.resourceClass) {
    [resource] = props.resourceClass.useList(queryData);
  }

  const namespacedColumns = ['name', 'statefulset', 'status', 'age', 'config'];
  const generalColumns = ['name', 'namespace', 'status', 'age', 'config'];

  if (!props || (props?.hideWithoutItems && (resource === undefined || resource?.length === 0))) {
    return <></>;
  }

  return (
    <SectionBox
      title={<SectionFilterHeader title="Device Servers" noNamespaceFilter={props?.namespace} />}
    >
      {props.resourceClass ? (
        <Table
          data={resource}
          defaultSortingColumn={1}
          filterFunction={
            props.namespace
              ? ns => (ns.jsonData.metadata?.namespace || null) === props.namespace.metadata.name
              : useFilterFunc()
          }
          columns={props.namespace ? namespacedColumns : generalColumns}
        />
      ) : (
        <Loader />
      )}
    </SectionBox>
  );
}
