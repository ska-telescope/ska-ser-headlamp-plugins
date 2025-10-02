import { K8s } from '@kinvolk/headlamp-plugin/lib';
import { ResourceListView, StatusLabel } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { capitalizeFirstLetter } from './utils';

export interface NamespaceListProps {
  filter: string;
  value: string;
}

export default function NamespaceList(props: NamespaceListProps) {
  function makeStatusLabel(namespace: K8s.ResourceClasses.Namespace) {
    const status = namespace.status.phase;
    return <StatusLabel status={status === 'Active' ? 'success' : 'error'}>{status}</StatusLabel>;
  }

  function makeOpStatusLabel(namespace: K8s.ResourceClasses.Namespace) {
    const resourceAnnotations = namespace.metadata.annotations || {};
    const namespace_status: string = resourceAnnotations['manager.cicd.skao.int/status'] || null;
    return (
      <StatusLabel
        status={
          ['ok'].indexOf(namespace_status) > -1
            ? 'success'
            : ['unstable', 'failing'].indexOf(namespace_status) > -1
            ? 'warning'
            : 'error'
        }
      >
        {namespace_status ? capitalizeFirstLetter(namespace_status) : 'Unknwon'}
      </StatusLabel>
    );
  }

  return (
    <>
      <ResourceListView
        title={'Persistent Namespaces'}
        headerProps={{
          noNamespaceFilter: true,
        }}
        resourceClass={K8s.ResourceClasses.Namespace}
        filterFunction={ns =>
          (ns.jsonData.metadata?.labels?.[props.filter] || null) === props.value &&
          !ns.jsonData.metadata?.name?.startsWith('ci-')
        }
        columns={[
          'name',
          {
            id: 'status',
            label: 'Status',
            getter: ns => {
              return makeStatusLabel(ns);
            },
          },
          'age',
        ]}
      />
      <ResourceListView
        title={'CI Namespaces'}
        headerProps={{
          noNamespaceFilter: true,
        }}
        resourceClass={K8s.ResourceClasses.Namespace}
        filterFunction={ns =>
          (ns.jsonData.metadata?.labels?.[props.filter] || null) === props.value &&
          ns.jsonData.metadata?.name?.startsWith('ci-')
        }
        columns={[
          'name',
          {
            id: 'status',
            label: 'Status',
            getter: ns => {
              return makeStatusLabel(ns);
            },
          },
          {
            id: 'operational_status',
            label: 'Operational Status',
            getter: ns => {
              return makeOpStatusLabel(ns);
            },
          },
          'age',
        ]}
      />
    </>
  );
}
