import { registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import Typography from '@mui/material/Typography';
import ProjectsList from './projectsList';
import TeamsList from './teamsList';
import UsersList from './usersList';

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
    return (
      <SectionBox title="Overview" textAlign="center" paddingTop={2}>
        <Typography>SKAO Overview</Typography>
      </SectionBox>
    );
  },
});

registerRoute({
  path: '/teams',
  sidebar: 'teams',
  name: 'Teams',
  exact: true,
  component: () => (
    <SectionBox title="Teams" textAlign="center" paddingTop={2}>
      <TeamsList />
    </SectionBox>
  ),
});

registerRoute({
  path: '/users',
  sidebar: 'users',
  name: 'Users',
  exact: true,
  component: () => (
    <SectionBox title="Users" textAlign="center" paddingTop={2}>
      <UsersList />
    </SectionBox>
  ),
});

registerRoute({
  path: '/projects',
  sidebar: 'projects',
  name: 'Projects',
  exact: true,
  component: () => (
    <SectionBox title="Projects" textAlign="center" paddingTop={2}>
      <ProjectsList />
    </SectionBox>
  ),
});
