import { StatusLabel as HLStatusLabel } from '@kinvolk/headlamp-plugin/lib/components/common';
import { KubeCRD } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';
import Tooltip from '@mui/material/Tooltip';

interface StatusLabelProps {
  item: KubeCRD;
}

export default function StatusLabel(props: StatusLabelProps) {
  const { item } = props;
  const state = item?.jsonData?.status?.state.toLowerCase();

  if (state.includes('waiting')) {
    const details = state.match(/\((.*?)\)/)?.[1];
    return (
      <Tooltip title={details || 'No additional details'} arrow disableInteractive={false}>
        <span style={{ display: 'inline-block' }}>
          <HLStatusLabel status="warning">Waiting</HLStatusLabel>
        </span>
      </Tooltip>
    );
  }
  if (state.includes('building')) {
    const details = state.match(/\((.*?)\)/)?.[1];
    return (
      <Tooltip title={details || 'No additional details'} arrow disableInteractive={false}>
        <span style={{ display: 'inline-block' }}>
          <HLStatusLabel status="warning">Building</HLStatusLabel>
        </span>
      </Tooltip>
    );
  }
  if (state.includes('error')) {  
    return (
      <Tooltip title={state || 'No additional details'} arrow disableInteractive={false}>
        <span style={{ display: 'inline-block' }}>
          <HLStatusLabel status="error">Error</HLStatusLabel>
        </span>
      </Tooltip>
    );
  }

  if (state === 'running') {
    return <HLStatusLabel status="success">Running</HLStatusLabel>;
  }

  return <HLStatusLabel status="error">{item?.jsonData?.status?.state}</HLStatusLabel>;
}
