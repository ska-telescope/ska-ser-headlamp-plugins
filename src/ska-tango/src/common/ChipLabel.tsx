{
  /* eslint-disable-next-line jsx-a11y/anchor-is-valid */
}

import { Loader } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Box } from '@material-ui/core';
import { blueGrey } from '@material-ui/core/colors';
import { Link } from '@mui/material';
import { Chip } from '@mui/material';
import { styled } from '@mui/system';

const PaddedChip = styled(Chip)({
  paddingTop: '2px',
  paddingBottom: '2px',
});

function UrlWrapper({ children, url }) {
  return url ? <Link href={url}>{children || url}</Link> : children;
}

export function ChipLabel({ label, value, url }: { label: string; value: any; url?: string }) {
  return (
    <Box display="flex" alignItems="center">
      <Box mr={1}>{label}:</Box>
      {!value ? (
        <Loader size={'0.5em'} noContainer />
      ) : (
        <UrlWrapper url={url}>
          <PaddedChip
            label={<strong>{value}</strong>}
            size="small"
            sx={url ? { backgroundColor: blueGrey[600] } : null}
          />
        </UrlWrapper>
      )}
    </Box>
  );
}
