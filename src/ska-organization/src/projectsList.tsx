import { K8s } from '@kinvolk/headlamp-plugin/lib';
import { Link, Loader, SimpleTable } from '@kinvolk/headlamp-plugin/lib/CommonComponents';

export default function ProjectsList() {
  const [namespaces, error] = K8s.ResourceClasses.Namespace.useList();
  if (error) {
    console.error('Failed to fetch namespaces:', error);
  }

  const projects =
    Array.from(
      new Set(
        namespaces
          ?.map(item => item.jsonData.metadata?.labels?.['cicd.skao.int/project'])
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
              getter: project => {
                return (
                  <Link routeName={'projects'} params={{ name: project }}>
                    {project}
                  </Link>
                );
              },
            },
            {
              label: 'Namespaces',
              getter: project => {
                return Array.from(
                  new Set(
                    namespaces
                      ?.filter(
                        item =>
                          (item.jsonData.metadata?.labels?.['cicd.skao.int/project'] || null) ===
                          project
                      )
                      .map(item => item.jsonData.metadata?.name)
                  )
                ).length;
              },
            },
            {
              label: 'Pipelines',
              getter: project => {
                return Array.from(
                  new Set(
                    namespaces
                      ?.filter(
                        item =>
                          (item.jsonData.metadata?.labels?.['cicd.skao.int/project'] || null) ===
                          project
                      )
                      .map(item => item.jsonData.metadata?.labels?.['cicd.skao.int/pipelineId'])
                      .filter(item => item !== undefined && item && item !== null)
                  )
                ).length;
              },
            },
            {
              label: 'Active Users',
              getter: project => {
                return Array.from(
                  new Set(
                    namespaces
                      ?.filter(
                        item =>
                          (item.jsonData.metadata?.labels?.['cicd.skao.int/project'] || null) ===
                          project
                      )
                      .map(item => item.jsonData.metadata?.labels?.['cicd.skao.int/author'])
                      .filter(item => item !== undefined && item && item !== null)
                  )
                ).length;
              },
            },
            {
              label: 'Active Teams',
              getter: project => {
                return Array.from(
                  new Set(
                    namespaces
                      ?.filter(
                        item =>
                          (item.jsonData.metadata?.labels?.['cicd.skao.int/project'] || null) ===
                          project
                      )
                      .map(item => item.jsonData.metadata?.labels?.['cicd.skao.int/team'])
                      .filter(item => item !== undefined && item && item !== null)
                  )
                ).length;
              },
            },
          ]}
          data={projects || []}
        />
      ) : (
        <Loader />
      )}
    </>
  );
}
