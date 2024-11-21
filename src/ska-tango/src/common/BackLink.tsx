import { Icon } from '@iconify/react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useHistory } from 'react-router-dom';

export default function BackLink() {
  const history = useHistory();

  return (
    <Button
      startIcon={<Icon icon="mdi:chevron-left" />}
      size="small"
      sx={theme => ({ color: theme.palette.primaryColor })}
      onClick={() => {
        history.goBack();
        return;
      }}
    >
      <Typography style={{ paddingTop: '3px' }}>{'Back'}</Typography>
    </Button>
  );
}
