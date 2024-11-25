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

export default function DatabaseDs() {
  return (
    <TangoDetectionWrapper omit={false}>
      <DatabaseDsListWrapper namespace={null} />
    </TangoDetectionWrapper>
  );
}

export function DatabaseDsListWrapper({ namespace }) {
  const [databaseDs] = K8s.ResourceClasses.CustomResourceDefinition.useGet(
    'databaseds.tango.tango-controls.org'
  );

  const databaseDsResourceClass = useMemo(() => {
    return databaseDs?.makeCRClass();
  }, [databaseDs]);

  return <DatabaseDsList resourceClass={databaseDsResourceClass} namespace={namespace} />;
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

  let filteredDatabaseDs;
  let databaseDs = [];
  if (props.resourceClass) {
    [databaseDs] = props.resourceClass.useList(queryData);
    filteredDatabaseDs = databaseDs;
  }

  // This shouldn't be needed, but useList is not filtering properly
  if (databaseDs && props.namespace) {
    filteredDatabaseDs = databaseDs.filter(
      item => item.jsonData.metadata.namespace === props.namespace.metadata.name
    );
  }

  const namespacedColumns = ['name', 'components', 'statefulset', 'dbstatefulset', 'status', 'age'];
  const generalColumns = [
    'name',
    'namespace',
    'components',
    'statefulset',
    'dbstatefulset',
    'status',
    'age',
  ];

  if (
    !props ||
    (props?.hideWithoutItems &&
      (filteredDatabaseDs === undefined || filteredDatabaseDs?.length === 0))
  ) {
    return <></>;
  }

  return (
    <SectionBox
      title={<SectionFilterHeader title="Database DS" noNamespaceFilter={props?.namespace} />}
    >
      {props.resourceClass ? (
        <Table
          data={filteredDatabaseDs}
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
