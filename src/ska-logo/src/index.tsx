import {
  AppLogoProps,
  registerAppLogo,
} from '@kinvolk/headlamp-plugin/lib';
import { SvgIcon } from '@mui/material';
import SKAOLogo from './skao_logo.svg';

function Logo(props: AppLogoProps) {
  const { className, sx } = props;

  return (

      <SvgIcon
        className={className}
        component={SKAOLogo}
        viewBox="0 0 398 109"
        sx={sx}
      />
  );
}
registerAppLogo(Logo);
