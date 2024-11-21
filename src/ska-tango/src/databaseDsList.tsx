import { K8s } from '@kinvolk/headlamp-plugin/lib';
import {
  Loader,
  SectionBox,
  SectionFilterHeader,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { KubeCRD } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';
import { useFilterFunc } from '@kinvolk/headlamp-plugin/lib/Utils';
import MuiLink from '@mui/material/Link';
import React, { useEffect, useState } from 'react';
import Table from './common/Table';
import { isTangoPingInstalled } from './request';

export default function DatabaseDs() {
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
    return (
      <SectionBox>
        <h1>SKA CRDs are not installed</h1>
        <p>
          Follow the{' '}
          <MuiLink target="_blank" href="https://gitlab.com/ska-telescope/ska-tango-operator">
            installation guide
          </MuiLink>{' '}
          to install the SKA Tango Operator and its CRDs
        </p>
      </SectionBox>
    );
  }

  return <DatabaseDsListWrapper namespace={null} />;
}

export function DatabaseDsListWrapper({ namespace }) {
  const [databaseDs] = K8s.ResourceClasses.CustomResourceDefinition.useGet(
    'databaseds.tango.tango-controls.org'
  );

  const databaseDsResourceClass = React.useMemo(() => {
    return databaseDs?.makeCRClass();
  }, [databaseDs]);

  return (
    <div>
      <DatabaseDsList resourceClass={databaseDsResourceClass} namespace={namespace} />
    </div>
  );
}

interface DatabaseDsListListProps {
  resourceClass: KubeCRD;
  namespace?: K8s.ResourceClasses.Namespace;
  hideWithoutItems?: boolean;
}

export function DatabaseDsList(props: DatabaseDsListListProps) {
  const queryData = {
    namespace: props?.namespace?.metadata.name || null,
  };

  let resource = undefined;
  if (props.resourceClass) {
    [resource] = props.resourceClass.useList(queryData);
  }

  const namespacedColumns = ['name', 'status', 'age'];
  const generalColumns = ['name', 'namespace', 'status', 'age'];

  if (!props || (props?.hideWithoutItems && (resource === undefined || resource?.length === 0))) {
    return <></>;
  }

  return (
    <SectionBox
      title={<SectionFilterHeader title="Database DS" noNamespaceFilter={props?.namespace} />}
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
