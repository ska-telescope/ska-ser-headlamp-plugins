import { StatusLabel as HLStatusLabel } from '@kinvolk/headlamp-plugin/lib/components/common';
import { KubeCRD } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';
import Tooltip from '@mui/material/Tooltip';
import { capitalizeFirstLetter, getDeviceServerStatus } from '../utils';

interface StatusLabelProps {
  item: KubeCRD;
}

export default function StatusLabel(props: StatusLabelProps) {
  const { item } = props;
  const { status, state, details } = getDeviceServerStatus(item?.jsonData?.status);

  if (details) {
    return (
      <Tooltip
        slotProps={{ tooltip: { sx: { fontSize: '0.9em' } } }}
        title={details || 'No additional details'}
        arrow
        disableInteractive={false}
      >
        <span style={{ display: 'inline-block' }}>
          <HLStatusLabel status={status}>{capitalizeFirstLetter(state)}</HLStatusLabel>
        </span>
      </Tooltip>
    );
  }

  return <HLStatusLabel status={status}>{capitalizeFirstLetter(state)}</HLStatusLabel>;
}
