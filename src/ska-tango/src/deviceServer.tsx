import { MetadataDictGrid, SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { ActionButton } from '@kinvolk/headlamp-plugin/lib/components/common';
import { useState } from 'react';
import { DeviceServerConfigView } from './common/Olhinho';
import TangoResourceDetailedView from './common/TangoResource';
import DevicesList from './devicesList';

export default function DeviceServerDetailedView() {
  const [showConfig, setShowConfig] = useState(false);

  const extraInfo = item => {
    const loadBalancerIP = item?.jsonData?.status?.resources?.lbs?.[0]?.ip;
    const dependencies = (item?.jsonData?.spec?.dependsOn || []).reduce((acc, dep) => {
      acc[dep] = dep;
      return acc;
    }, {});

    return [
      {
        name: 'Dependencies',
        value: <MetadataDictGrid showKeys={false} dict={dependencies}/>
      },
      (loadBalancerIP
        ? {
            name: 'Loadbalancer IP',
            value: loadBalancerIP,
          }
        : null)
    ].filter(info => info !== null);
  };

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

  const extraSections = (item: any) => {
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
      extraSections={extraSections}
      extraInfo={extraInfo}
    />
  );
}
