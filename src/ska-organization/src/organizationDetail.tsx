import { K8s } from '@kinvolk/headlamp-plugin/lib';
import { Loader, SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { useParams } from 'react-router-dom';
import BackLink from './backLink';
import NamespaceList from './namespaceList';

export interface OrganizationDetailProps {
  type: string;
  filter: string;
}

export default function OrganizationDetail(props: OrganizationDetailProps) {
  const { name } = useParams<{ name: string }>();
  const [namespaces, error] = K8s.ResourceClasses.Namespace.useList();
  if (error) {
    console.error('Failed to fetch namespaces:', error);
  }

  return (
    <>
      <BackLink></BackLink>
      {namespaces ? (
        <SectionBox title={`${props.type} ${name}`} textAlign="center" paddingTop={2}>
          <NamespaceList filter={props.filter} value={name}></NamespaceList>
        </SectionBox>
      ) : (
        <Loader></Loader>
      )}
    </>
  );
}
