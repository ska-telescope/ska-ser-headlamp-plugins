import { registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Organization } from './organization';
import OrganizationDetail from './organizationDetail';
import OrganizationList from './organizationList';

registerSidebarEntry({
  parent: null,
  name: 'skao',
  label: 'SKAO',
  url: '/skao',
  icon: 'mdi:earth',
});

registerSidebarEntry({
  parent: 'skao',
  name: 'teams',
  label: 'Teams',
  url: '/teams',
  icon: 'mdi:account-group',
});

registerSidebarEntry({
  parent: 'skao',
  name: 'users',
  label: 'Users',
  url: '/users',
  icon: 'mdi:account',
});

registerSidebarEntry({
  parent: 'skao',
  name: 'projects',
  label: 'Projects',
  url: '/projects',
  icon: 'mdi:rocket-outline',
});

registerRoute({
  path: '/skao',
  sidebar: 'skao',
  name: 'skao',
  exact: true,
  component: () => {
    return <Organization></Organization>;
  },
});

registerRoute({
  path: '/teams',
  sidebar: 'teams',
  name: 'Teams',
  exact: true,
  component: () => (
    <SectionBox title="Teams" textAlign="center" paddingTop={2}>
      <OrganizationList
        filter="cicd.skao.int/team"
        path="/teams"
        extraColumns={[
          {
            label: 'Active Projects',
            render: (namespaces: any[], element: any) => {
              return Array.from(
                new Set(
                  namespaces
                    ?.filter(
                      item =>
                        (item.jsonData.metadata?.labels?.['cicd.skao.int/team'] || null) === element
                    )
                    .map(item => item.jsonData.metadata?.labels?.['cicd.skao.int/project'])
                    .filter(item => item !== undefined && item && item !== null)
                )
              ).length;
            },
          },
          {
            label: 'Active Users',
            render: (namespaces: any[], element: any) => {
              return Array.from(
                new Set(
                  namespaces
                    ?.filter(
                      item =>
                        (item.jsonData.metadata?.labels?.['cicd.skao.int/team'] || null) === element
                    )
                    .map(item => item.jsonData.metadata?.labels?.['cicd.skao.int/author'])
                    .filter(item => item !== undefined && item && item !== null)
                )
              ).length;
            },
          },
        ]}
      />
    </SectionBox>
  ),
});

registerRoute({
  path: '/teams/:name',
  sidebar: 'teams',
  name: 'team',
  exact: true,
  component: () => <OrganizationDetail filter="cicd.skao.int/team" type="Team" />,
});

registerRoute({
  path: '/users',
  sidebar: 'users',
  name: 'Users',
  exact: true,
  component: () => (
    <SectionBox title="Users" textAlign="center" paddingTop={2}>
      <OrganizationList
        filter="cicd.skao.int/author"
        path="/users"
        extraColumns={[
          {
            label: 'Active Projects',
            render: (namespaces: any[], element: any) => {
              return Array.from(
                new Set(
                  namespaces
                    ?.filter(
                      item =>
                        (item.jsonData.metadata?.labels?.['cicd.skao.int/author'] || null) ===
                        element
                    )
                    .map(item => item.jsonData.metadata?.labels?.['cicd.skao.int/project'])
                    .filter(item => item !== undefined && item && item !== null)
                )
              ).length;
            },
          },
        ]}
      />
    </SectionBox>
  ),
});

registerRoute({
  path: '/users/:name',
  sidebar: 'users',
  name: 'user',
  exact: true,
  component: () => <OrganizationDetail filter="cicd.skao.int/author" type="User" />,
});

registerRoute({
  path: '/projects',
  sidebar: 'projects',
  name: 'Projects',
  exact: true,
  component: () => (
    <SectionBox title="Projects" textAlign="center" paddingTop={2}>
      <OrganizationList
        filter="cicd.skao.int/project"
        path="/projects"
        extraColumns={[
          {
            label: 'Active Users',
            render: (namespaces: any[], element: any) => {
              return Array.from(
                new Set(
                  namespaces
                    ?.filter(
                      item =>
                        (item.jsonData.metadata?.labels?.['cicd.skao.int/project'] || null) ===
                        element
                    )
                    .map(item => item.jsonData.metadata?.labels?.['cicd.skao.int/author'])
                    .filter(item => item !== undefined && item && item !== null)
                )
              ).length;
            },
          },
          {
            label: 'Active Teams',
            render: (namespaces: any[], element: any) => {
              return Array.from(
                new Set(
                  namespaces
                    ?.filter(
                      item =>
                        (item.jsonData.metadata?.labels?.['cicd.skao.int/project'] || null) ===
                        element
                    )
                    .map(item => item.jsonData.metadata?.labels?.['cicd.skao.int/team'])
                    .filter(item => item !== undefined && item && item !== null)
                )
              ).length;
            },
          },
        ]}
      />
    </SectionBox>
  ),
});

registerRoute({
  path: '/projects/:name',
  sidebar: 'projects',
  name: 'project',
  exact: true,
  component: () => <OrganizationDetail filter="cicd.skao.int/project" type="Projects" />,
});
