import { K8s } from '@kinvolk/headlamp-plugin/lib';
import { ResourceListView, StatusLabel } from '@kinvolk/headlamp-plugin/lib/CommonComponents';

export interface NamespaceListProps {
  filter: string;
  value: string;
}

export default function NamespaceList(props: NamespaceListProps) {
  function makeStatusLabel(namespace: K8s.ResourceClasses.Namespace) {
    const status = namespace.status.phase;
    return <StatusLabel status={status === 'Active' ? 'success' : 'error'}>{status}</StatusLabel>;
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
          'age',
        ]}
      />
    </>
  );
}
