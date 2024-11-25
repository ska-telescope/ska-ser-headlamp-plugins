import { Icon } from '@iconify/react';
import { Box, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material';
import { Paper } from '@mui/material';
import { Handle, Position } from '@xyflow/react';
import {
  capitalizeFirstLetter,
  getDeviceServerStatus,
  tangoDeviceStatusColorFromState,
  timeAgo,
} from './utils';

export interface NodeLabelProps {
  status: string;
  children?: any;
  outline?: boolean;
}

export function TangoResourceNodeWrapper(props: NodeLabelProps) {
  const theme = useTheme();
  const { status, children, outline } = props;
  const statuses = ['success', 'warning', 'error'];
  const bgColor =
    statuses.includes(status) && !outline
      ? theme.palette[status].light
      : theme.palette.normalEventBg;
  const borderColor = statuses.includes(status)
    ? theme.palette[status].light
    : theme.palette.normalEventBg;
  const color = statuses.includes(status) ? theme.palette[status].main : theme.palette.text.primary;

  return (
    <Paper
      sx={{
        color: theme.palette.primary.contrastText,
        fontSize: theme.typography.pxToRem(12),
        paddingLeft: theme.spacing(0.75),
        paddingRight: theme.spacing(0.75),
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        display: 'inline-flex',
        alignItems: 'normal',
        borderRadius: theme.spacing(0.5),
      }}
      variant={outline ? 'outlined' : null}
      style={{
        backgroundColor: bgColor,
        color,
        borderColor: borderColor,
      }}
    >
      {children}
    </Paper>
  );
}

export function DatabaseDsNode({ data }) {
  // TODO: Add Details and actually pull data from DatabaseDs
  const details = null;
  return (
    <TangoResourceNodeWrapper status={'success'} {...data}>
      <Tooltip title={details} arrow disableInteractive={false}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Icon icon="mdi:database-marker" width={12} height={12} />
          <Typography sx={{ fontSize: '0.6rem' }} variant="caption">
            {data.label}
          </Typography>
        </Box>
      </Tooltip>
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </TangoResourceNodeWrapper>
  );
}

export function DeviceServerNode({ data }) {
  const theme = useTheme();
  const { status } = getDeviceServerStatus(data?.deviceServer);
  const updatedSince = data?.device?.retTime
    ? timeAgo(new Date(data?.device?.retTime).getTime(), { format: 'brief' })
    : null;
  const details = data.device ? (
    <Box display="inline-flex" sx={{ flexDirection: 'column' }} alignItems="flex-start" gap={0.25}>
      <span>
        State: <b>{capitalizeFirstLetter(data.device.state || 'unknown')}</b>
      </span>
      <span>
        Status: <b>{data.device.status || 'Unknown'}</b>
      </span>
      <span>
        Ping: <b>{data.device.ping || -1}ms</b>
      </span>
      <span>
        Updated: <b>{updatedSince ? `${updatedSince} ago` : 'Unknown'}</b>{' '}
      </span>
    </Box>
  ) : null;

  return (
    <TangoResourceNodeWrapper {...data} status={status} outline>
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <Tooltip title={details} arrow disableInteractive={false}>
        <Box display="flex" alignItems="center" gap={1}>
          <Icon
            icon="mdi:broadcast"
            color={theme.palette[tangoDeviceStatusColorFromState(data.device)].main}
            width={12}
            height={12}
          />
          <Typography sx={{ fontSize: '0.6rem' }} variant="caption">
            {data.label}
          </Typography>
        </Box>
      </Tooltip>
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </TangoResourceNodeWrapper>
  );
}
