import { SectionBox } from '@kinvolk/headlamp-plugin/lib/components/common';
import MuiLink from '@mui/material/Link';

export default function TangoNotInstalled() {
  return (
    <SectionBox>
      <h1>SKA CRDs are not installed</h1>
      <p>
        Follow the{' '}
        <MuiLink target="_blank" href="https://gitlab.com/ska-telescope/ska-tango-operator">
          installation guide
        </MuiLink>{' '}
        to install the SKA Tango Operator and its CRDs
      </p>
    </SectionBox>
  );
}
