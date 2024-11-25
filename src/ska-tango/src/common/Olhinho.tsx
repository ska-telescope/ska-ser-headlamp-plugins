import {
  ActionButton,
  ButtonStyle,
  Dialog,
  DialogProps as HeadlampDialogProps,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/lib/k8s/KubeObject';
import { DialogActions } from '@mui/material';
import { DialogContent } from '@mui/material';
import Button from '@mui/material/Button';
import { Dispatch, SetStateAction, useState } from 'react';
import ReactJson from 'react-json-view';

export interface DeviceServerConfigActionProps extends HeadlampDialogProps {
  resource: KubeObject;
  buttonStyle?: ButtonStyle;
}

export interface DeviceServerConfigProps extends DeviceServerConfigActionProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  title?: string;
}

export function DeviceServerConfigAction(props: DeviceServerConfigActionProps) {
  const { buttonStyle } = props;
  const [open, setOpen] = useState(false);

  return (
    <>
      <ActionButton
        description=""
        buttonStyle={buttonStyle || 'menu'}
        onClick={() => setOpen(true)}
        icon="mdi:eye"
        edge="end"
      />
      <DeviceServerConfigView open={open} setOpen={setOpen} {...props} withFullScreen />
    </>
  );
}

export function DeviceServerConfigView(props: DeviceServerConfigProps) {
  const { resource, open, setOpen, title, maxWidth, ...otherProps } = props;
  const config = JSON.parse(resource?.jsonData.spec?.config || '{}');
  const dependsOn = resource?.jsonData.spec?.dependsOn || {};
  const dialogTitle =
    title || `Device Server Configuration: ${resource?.jsonData?.metadata.name || 'Unknown'}`;
  const combinedJson = {
    config,
    dependsOn,
  };

  return (
    <>
      {open && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullWidth
          {...otherProps}
          title={dialogTitle}
          scroll="paper"
          maxWidth={maxWidth || 'lg'}
        >
          <DialogContent>
            {/* REFACTOR THE VIEW TO USE @monaco-editor/react */}
            <ReactJson
              src={combinedJson}
              theme="monokai"
              style={{ padding: '10px', borderRadius: '5px' }}
              enableClipboard={false}
              displayDataTypes={false}
              displayObjectSize={false}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
