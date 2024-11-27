import { DateLabel, Loader, SimpleTable } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { StatusLabel as HLStatusLabel } from '@kinvolk/headlamp-plugin/lib/components/common';

export interface DevicesListProps {
  resources?: any;
}

export default function DevicesList(props: DevicesListProps) {
  const deviceServer = props.resources;
  const devices = deviceServer?.jsonData?.status?.devices || [];
  const columns = [
    {
      label: 'Name',
      getter: device => device.name || '-',
      sort: (a, b) => {
        return a?.name?.toLowerCase() > b?.name?.toLowerCase() ? 1 : -1;
      },
    },
    {
      label: 'Class',
      getter: device => device.class || '-',
      sort: (a, b) => {
        return a?.class?.toLowerCase() > b?.class?.toLowerCase() ? 1 : -1;
      },
    },
    {
      label: 'Ping',
      getter: device => {
        const ping = device.ping || null;
        if (ping === null) {
          return <span>-</span>;
        }

        let color;
        if (ping < 0) {
          color = 'error';
        } else if (ping < 150) {
          color = 'success';
        } else if (ping < 500) {
          color = 'warning';
        } else {
          color = 'error';
        }

        return <HLStatusLabel status={color}>{`${ping} ms`}</HLStatusLabel>;
      },
      sort: (a, b) => {
        return a?.ping > b?.ping ? 1 : -1;
      },
    },
    {
      label: 'State',
      getter: device => {
        const state = device.state || 'UNKNOWN';
        const redStates = ['FAULT', 'ALARM', 'UNKNOWN'];
        const orangeStates = ['OFF', 'CLOSE', 'STANDBY', 'INIT', 'DISABLE'];
        let color: 'success' | 'warning' | 'error' | '' = 'success';

        if (redStates.includes(state.toUpperCase())) {
          color = 'error';
        } else if (orangeStates.includes(state.toUpperCase())) {
          color = 'warning';
        }

        return <HLStatusLabel status={color}>{state}</HLStatusLabel>;
      },
      sort: (a, b) => {
        return a?.state > b?.pistateng ? 1 : -1;
      },
    },
    {
      label: 'Status Age',
      gridTemplate: 'min-content',
      getter: device => {
        const age = device.retTime || null;
        if (age === null) {
          return <span>-</span>;
        }

        return <DateLabel date={new Date(age).getTime()} format="mini" />;
      },
    },
  ];

  return (
    <>
      {deviceServer ? (
        <SimpleTable columns={columns} data={devices} emptyMessage="No devices found" />
      ) : (
        <Loader />
      )}
    </>
  );
}
