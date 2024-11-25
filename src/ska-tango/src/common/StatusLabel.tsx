import { StatusLabel as HLStatusLabel } from '@kinvolk/headlamp-plugin/lib/components/common';
import { KubeCRD } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';
import Tooltip from '@mui/material/Tooltip';


interface StatusLabelProps {
  item: KubeCRD;
}

export default function StatusLabel(props: StatusLabelProps) {
  const { item } = props;
  // const ready = item?.jsonData?.status?.conditions?.find(c => c.type === 'Ready');
  const state = item?.jsonData?.status?.state;

  if (state.includes('Waiting')) {
    const waitingDetails = state.includes('Waiting') 
    ? state.match(/\((.*?)\)/)?.[1] // Extracts the part inside parentheses
    : null;
    console.log(waitingDetails)
    return (
      <Tooltip
        title={waitingDetails || 'No additional details'}
        arrow
        disableInteractive={false} // Ensure tooltip works with nested elements
      >
        <span style={{ display: 'inline-block' }}> {/* Wrapper ensures hover area */}
          <HLStatusLabel status="warning">Waiting</HLStatusLabel>
        </span>
      </Tooltip>
    );
  }

  if (state === "Running") {
    return <HLStatusLabel status="success">Running</HLStatusLabel>;
  }

  return <HLStatusLabel status="error">Unkown</HLStatusLabel>;

}
