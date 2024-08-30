import { K8s } from '@kinvolk/headlamp-plugin/lib';
import { Link, Loader, SimpleTable } from '@kinvolk/headlamp-plugin/lib/CommonComponents';

export default function UsersList() {
  const [namespaces, error] = K8s.ResourceClasses.Namespace.useList();
  if (error) {
    console.error('Failed to fetch namespaces:', error);
  }

  const users =
    Array.from(
      new Set(
        namespaces
          ?.map(item => item.jsonData.metadata?.labels?.['cicd.skao.int/author'])
          .filter(value => value !== undefined && value && value !== '')
      )
    ) || [];

  return (
    <>
      {namespaces ? (
        <SimpleTable
          columns={[
            {
              label: 'Name',
              getter: user => {
                return (
                  <Link routeName={'users'} params={{ name: user }}>
                    {user}
                  </Link>
                );
              },
            },
            {
              label: 'Namespaces',
              getter: user => {
                return Array.from(
                  new Set(
                    namespaces
                      ?.filter(
                        item =>
                          (item.jsonData.metadata?.labels?.['cicd.skao.int/author'] || null) ===
                          user
                      )
                      .map(item => item.jsonData.metadata?.name)
                  )
                ).length;
              },
            },
            {
              label: 'Pipelines',
              getter: user => {
                return Array.from(
                  new Set(
                    namespaces
                      ?.filter(
                        item =>
                          (item.jsonData.metadata?.labels?.['cicd.skao.int/author'] || null) ===
                          user
                      )
                      .map(item => item.jsonData.metadata?.labels?.['cicd.skao.int/pipelineId'])
                      .filter(item => item !== undefined && item && item !== null)
                  )
                ).length;
              },
            },
            {
              label: 'Active Projects',
              getter: user => {
                return Array.from(
                  new Set(
                    namespaces
                      ?.filter(
                        item =>
                          (item.jsonData.metadata?.labels?.['cicd.skao.int/author'] || null) ===
                          user
                      )
                      .map(item => item.jsonData.metadata?.labels?.['cicd.skao.int/project'])
                      .filter(item => item !== undefined && item && item !== null)
                  )
                ).length;
              },
            },
          ]}
          data={users || []}
        />
      ) : (
        <Loader />
      )}
    </>
  );
}
