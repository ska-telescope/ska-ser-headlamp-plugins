import { ApiProxy } from '@kinvolk/headlamp-plugin/lib';
import React from 'react';
import {
  Link,
} from '@kinvolk/headlamp-plugin/lib/components/common';


interface RequestStatefulSetProps {
	labelSelector: string;
  namespace: string;
	name: string;
}

export default function StatefulSetFind(props: RequestStatefulSetProps) {
    const request = ApiProxy.request;
    const queryParams = new URLSearchParams();
    queryParams.append('labelSelector', props.labelSelector);

    const [statefulsetName, setStatefulsetName] = React.useState('Loading...');

    React.useEffect(() => {
      
      request(
        `/apis/apps/v1/namespaces/${
          props.namespace
        }/statefulsets?${queryParams.toString()}`,
        {
          method: 'GET',
        }
      )
        .then(response => {
          if (response.items && response.items.length > 0) {
            setStatefulsetName(response.items[0].metadata.name);
          } else {
            setStatefulsetName('Null');
          }
        })
        .catch(error => {
          console.error('Error fetching StatefulSet:', error);
          setStatefulsetName('Error');
        });
    }, [props.name, props.namespace]);

		if (statefulsetName === 'Null') {
			return <span>No StatefulSet found</span>;
		}

    return (
      <Link
        routeName="statefulset"
        params={{
          name: statefulsetName,
          namespace: props.namespace,
        }}
      >
        {statefulsetName}
      </Link>
    );

}
