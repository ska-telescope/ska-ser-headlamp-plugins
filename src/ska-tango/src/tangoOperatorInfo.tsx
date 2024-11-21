import { K8s } from '@kinvolk/headlamp-plugin/lib';
import { Box, Paper } from '@mui/material';
import { ChipLabel } from './common/ChipLabel';

function getImageVersion(deployment: K8s.ResourceClasses.Deployment[], container: string) {
  if (deployment === undefined || deployment.length === 0) {
    return null;
  }

  const containers = (deployment[0].jsonData.spec?.template?.spec?.containers || []).filter(item =>
    container ? item.name === container : true
  );
  if (containers === undefined || containers.length === 0) {
    return null;
  }

  return containers[0].image.split(':')[1];
}

export function TangoOperatorInfo({ crdVersion }) {
  const [deployments] = K8s.ResourceClasses.Deployment.useList();
  const operator = deployments?.filter(
    item => item?.metadata?.labels?.['app.kubernetes.io/name'] === 'ska-tango-operator'
  );
  const ping = deployments?.filter(
    item => item?.metadata?.labels?.['app.kubernetes.io/name'] === 'ska-tango-ping'
  );

  return (
    <Paper
      sx={theme => ({
        background: theme.palette.squareButton.background,
        padding: theme.spacing(2),
        height: '100%',
        maxWidth: {
          xs: '300px',
          sm: '600px',
        },
        margin: '0 auto',
      })}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <ChipLabel label={'CRD'} value={crdVersion}></ChipLabel>
        <ChipLabel
          label={'Operator'}
          value={getImageVersion(operator, 'manager')}
          url={
            'https://harbor.skao.int/harbor/projects/2/repositories/ska-tango-operator/artifacts-tab'
          }
        ></ChipLabel>
        <ChipLabel
          label={'Ping'}
          value={getImageVersion(ping, null)}
          url={
            'https://harbor.skao.int/harbor/projects/2/repositories/ska-tango-ping/artifacts-tab'
          }
        ></ChipLabel>
      </Box>
    </Paper>
  );
}
