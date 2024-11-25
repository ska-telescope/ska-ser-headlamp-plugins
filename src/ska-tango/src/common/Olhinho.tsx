import {
  ActionButton,
  ButtonStyle,
  Dialog,
  DialogProps as HeadlampDialogProps,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/lib/k8s/KubeObject';
import { Editor } from '@monaco-editor/react';
import { DialogActions } from '@mui/material';
import { DialogContent } from '@mui/material';
import Button from '@mui/material/Button';
import { Dispatch, SetStateAction, useState } from 'react';
import { getThemeName } from '../utils';

export interface DeviceServerConfigActionProps {
  resource: KubeObject;
  buttonStyle?: ButtonStyle;
}
export type DeviceServerConfigActionPropsFull = DeviceServerConfigActionProps & HeadlampDialogProps;

export interface DeviceServerConfigProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  title?: string;
}
export type DeviceServerConfigPropsFull = DeviceServerConfigProps &
  DeviceServerConfigActionPropsFull;

export function DeviceServerConfigAction(props: DeviceServerConfigActionPropsFull) {
  const { buttonStyle } = props;
  const [open, setOpen] = useState(false);

  return (
    <>
      <ActionButton
        description=""
        buttonStyle={buttonStyle || 'action'}
        onClick={() => setOpen(true)}
        icon="mdi:eye"
        edge="end"
      />
      <DeviceServerConfigView open={open} setOpen={setOpen} {...props} withFullScreen />
    </>
  );
}

export function DeviceServerConfigView(props: DeviceServerConfigPropsFull) {
  const { resource, open, setOpen, title, maxWidth, ...otherProps } = props;
  const config = JSON.parse(resource?.jsonData.spec?.config || '{}');
  const dependsOn = resource?.jsonData.spec?.dependsOn || {};
  const dialogTitle =
    title || `Device Server Configuration: ${resource?.jsonData?.metadata.name || 'Unknown'}`;
  const themeName = getThemeName();
  const editorOptions = {
    selectOnLineNumbers: true,
    readOnly: true,
    automaticLayout: true,
    mouseWheelZoom: true,
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
          <DialogContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              height: '100%',
            }}
          >
            <Editor
              language={'json'}
              theme={themeName === 'dark' ? 'vs-dark' : 'light'}
              value={JSON.stringify(
                {
                  config,
                  dependsOn,
                },
                null,
                4
              )}
              options={editorOptions}
              height={'80vh'}
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
