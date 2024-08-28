import {
    registerRoute,
    registerSidebarEntry,
  } from '@kinvolk/headlamp-plugin/lib';
  import { 
    SectionBox,
    ResourceTable,
  } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
  import Typography from '@mui/material/Typography';
  import React from 'react';
  import { useApiList } from '@kinvolk/headlamp-plugin/lib';
  import { pod } from '@kinvolk/headlamp-plugin/lib/k8s/';
  import Pod from '@kinvolk/headlamp-plugin/lib/k8s/';

  // A top level item in the sidebar.
  // The sidebar link URL is: /c/mycluster/teams
  registerSidebarEntry({
    parent: null,
    name: 'teams',
    label: 'Teams',
    url: '/teams',
    icon: 'mdi:account-group'
  });
  
const TeamsComponent = () => {

  return (
    <SectionBox title="Teams" textAlign="center" paddingTop={2}>
      <Typography variant="h5">Teams and Users</Typography>
      <Typography>test</Typography>
    </SectionBox>
  );
};

// Register the route for the Teams component
registerRoute({
  path: '/teams',
  exact: true,
  component: TeamsComponent,
});