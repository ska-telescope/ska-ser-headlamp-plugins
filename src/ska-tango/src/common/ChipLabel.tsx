{
  /* eslint-disable-next-line jsx-a11y/anchor-is-valid */
}

import { Loader } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Box } from '@material-ui/core';
import { blueGrey } from '@material-ui/core/colors';
import { Link } from '@mui/material';
import { Chip } from '@mui/material';
import { styled } from '@mui/system';

export const PaddedChip = styled(Chip)({
  paddingTop: '0.2rem',
});

function UrlWrapper({ children, url, wrap }) {
  const wrapChildren = url && wrap;
  return wrapChildren ? <Link href={url}>{children || url}</Link> : children;
}

export function ChipLabel({
  label,
  value,
  url,
  urlOnLabel,
}: {
  label: string;
  value: any;
  url?: string;
  urlOnLabel?: boolean;
}) {
  const applyLinkOnLabel = urlOnLabel || false;
  return (
    <Box display="flex" alignItems="center">
      <Box mr={1}>
        <UrlWrapper url={url} wrap={applyLinkOnLabel}>
          <span>{label}</span>
        </UrlWrapper>
      </Box>
      {!value ? (
        <Loader size={'0.5rem'} noContainer />
      ) : (
        <UrlWrapper url={url} wrap={!applyLinkOnLabel}>
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
