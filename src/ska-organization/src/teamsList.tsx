import { K8s } from '@kinvolk/headlamp-plugin/lib';
import { Link, Loader, SimpleTable } from '@kinvolk/headlamp-plugin/lib/CommonComponents';

export default function TeamsList() {
  const [namespaces, error] = K8s.ResourceClasses.Namespace.useList();
  if (error) {
    console.error('Failed to fetch namespaces:', error);
  }

  const teams =
    Array.from(
      new Set(
        namespaces
          ?.map(item => item.jsonData.metadata?.labels?.['cicd.skao.int/team'])
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
              getter: team => {
                return (
                  <Link routeName={'teams'} params={{ name: team }}>
                    {team}
                  </Link>
                );
              },
            },
            {
              label: 'Namespaces',
              getter: team => {
                return Array.from(
                  new Set(
                    namespaces
                      ?.filter(
                        item =>
                          (item.jsonData.metadata?.labels?.['cicd.skao.int/team'] || null) === team
                      )
                      .map(item => item.jsonData.metadata?.name)
                  )
                ).length;
              },
            },
            {
              label: 'Pipelines',
              getter: team => {
                return Array.from(
                  new Set(
                    namespaces
                      ?.filter(
                        item =>
                          (item.jsonData.metadata?.labels?.['cicd.skao.int/team'] || null) === team
                      )
                      .map(item => item.jsonData.metadata?.labels?.['cicd.skao.int/pipelineId'])
                      .filter(item => item !== undefined && item && item !== null)
                  )
                ).length;
              },
            },
            {
              label: 'Active Projects',
              getter: team => {
                return Array.from(
                  new Set(
                    namespaces
                      ?.filter(
                        item =>
                          (item.jsonData.metadata?.labels?.['cicd.skao.int/team'] || null) === team
                      )
                      .map(item => item.jsonData.metadata?.labels?.['cicd.skao.int/project'])
                      .filter(item => item !== undefined && item && item !== null)
                  )
                ).length;
              },
            },
            {
              label: 'Active Users',
              getter: team => {
                return Array.from(
                  new Set(
                    namespaces
                      ?.filter(
                        item =>
                          (item.jsonData.metadata?.labels?.['cicd.skao.int/team'] || null) === team
                      )
                      .map(item => item.jsonData.metadata?.labels?.['cicd.skao.int/author'])
                      .filter(item => item !== undefined && item && item !== null)
                  )
                ).length;
              },
            },
          ]}
          data={teams || []}
        />
      ) : (
        <Loader />
      )}
    </>
  );
}
