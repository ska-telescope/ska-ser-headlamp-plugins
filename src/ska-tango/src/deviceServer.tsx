import { SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { ActionButton } from '@kinvolk/headlamp-plugin/lib/components/common';
import { useState } from 'react';
import { DeviceServerConfigView } from './common/Olhinho';
import TangoResourceDetailedView from './common/TangoResource';
import DevicesList from './devicesList';

export default function DeviceServerDetailedView() {
  const [showConfig, setShowConfig] = useState(false);

  const actions = item => {
    return [
      {
        id: 'DS_CONFIG',
        action: (
          <>
            <ActionButton
              description={'Show Config'}
              aria-label={'config'}
              icon="mdi:eye"
              onClick={() => {
                setShowConfig(true);
              }}
            />
            <DeviceServerConfigView
              open={showConfig}
              setOpen={setShowConfig}
              resource={item}
              withFullScreen
            />
          </>
        ),
      },
    ];
  };

  const extra_deviceServers = (item: any) => {
    return [
      {
        id: 'devices',
        section: (
          <SectionBox title="Devices" textAlign="center" paddingTop={2}>
            <DevicesList resources={item} />
          </SectionBox>
        ),
      },
    ];
  };

  return (
    <TangoResourceDetailedView
      resourceType="deviceservers"
      actions={actions}
      extraSections={extra_deviceServers}
    />
  );
}
