import { K8s } from '@kinvolk/headlamp-plugin/lib';
import { Link } from '@kinvolk/headlamp-plugin/lib/components/common';

interface RequestStatefulSetProps {
  name: string;
  namespace: string;
  allowedNames: string[];
}

export default function StatefulSetFinder(props: RequestStatefulSetProps) {
  const [statefulSets] = K8s.ResourceClasses.StatefulSet.useList({
    namespace: props.namespace,
    labelSelector: `app.kubernetes.io/instance=${props.name}`,
  });

  const statefulSet =
    statefulSets
      ?.filter(
        item => props.allowedNames.indexOf(item.metadata.labels['app.kubernetes.io/name']) > -1
      )
      ?.at(0) || null;

  return (
    <>
      {!statefulSet && <span>-</span>}
      {statefulSet && (
        <Link
          routeName="statefulset"
          params={{
            name: statefulSet.jsonData.metadata.name,
            namespace: props.namespace,
          }}
        >
          {statefulSet.jsonData.metadata.name}
        </Link>
      )}
    </>
  );
}
