import React, { useState } from 'react';
import { ButtonStyle, ActionButton } from '@kinvolk/headlamp-plugin/lib/components/common';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import ReactJson from 'react-json-view';

export interface ViewButtonProps {
  /** The JSON data to view */
  jsonData: object;
  /** Style of the button */
  buttonStyle?: ButtonStyle;
}

const ViewButton: React.FC<ViewButtonProps> = ({
  jsonData,
  buttonStyle = 'menu',
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <ActionButton
        description=""
        buttonStyle={buttonStyle}
        onClick={handleOpen}
        icon="mdi:eye"
        edge="end"
      />
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>JSON Viewer</DialogTitle>
        <DialogContent>
          <ReactJson
            src={jsonData}
            theme="monokai"
            style={{ padding: '10px', borderRadius: '5px' }}
            enableClipboard={false}
            displayDataTypes={false}
            displayObjectSize={false}
            // Removed handlers to disable editing
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewButton;