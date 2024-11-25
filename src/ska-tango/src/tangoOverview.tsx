import { K8s } from '@kinvolk/headlamp-plugin/lib';
import { Loader, TileChart } from '@kinvolk/headlamp-plugin/lib/components/common';
import { Grid, useTheme } from '@material-ui/core';
import React from 'react';
import { DeviceServersList } from './deviceServersList';
import { TangoOperatorInfo } from './tangoOperatorInfo';

export function TangoOverviewWrapper() {
  const [deviceServersCRD] = K8s.ResourceClasses.CustomResourceDefinition.useGet(
    'deviceservers.tango.tango-controls.org'
  );

  const deviceServersResourceClass = React.useMemo(() => {
    return deviceServersCRD?.makeCRClass();
  }, [deviceServersCRD]);

  const [databaseDs] = K8s.ResourceClasses.CustomResourceDefinition.useGet(
    'databaseds.tango.tango-controls.org'
  );

  const databaseDsResourceClass = React.useMemo(() => {
    return databaseDs?.makeCRClass();
  }, [databaseDs]);

  return !deviceServersResourceClass || !databaseDsResourceClass ? (
    <Loader />
  ) : (
    <TangoOverview
      crdVersion={
        deviceServersCRD?.jsonData.spec.versions.filter(item => item.served)[0].name || 'Unknown'
      }
      deviceServersResourceClass={deviceServersResourceClass}
      databaseDsResourceClass={databaseDsResourceClass}
    />
  );
}

function TangoOverview({ crdVersion, deviceServersResourceClass, databaseDsResourceClass }) {
  const theme = useTheme();
  const [deviceServers] = deviceServersResourceClass.useList();
  const [databaseDs] = databaseDsResourceClass.useList();
  const [statefulSets] = K8s.ResourceClasses.StatefulSet.useList();

  // Grab Device Server resource by state
  const devServerTotalNum = deviceServers?.length;
  const devServerRunning = [];
  const devServerWaiting = [];
  let devicesTotalNum = 0;
  let devicesRunningNum = 0;
  (deviceServers || []).forEach(item => {
    if (item?.jsonData?.status) {
      devicesTotalNum += item.jsonData.status?.devicecount || 0;
      devicesRunningNum += item.jsonData.status?.devicereadycount || 0;
    }

    if (item?.jsonData?.status && item.jsonData.status.state.toLowerCase() === 'running') {
      devServerRunning.push(item);
    } else {
      devServerWaiting.push(item);
    }
  });

  // Grab DatabaseDs resource by state
  const dbTotalNum = databaseDs?.length;
  const dbRunning = [];
  const dbWaiting = [];
  (databaseDs || []).forEach(item => {
    if (item?.jsonData?.status && item.jsonData.status.state.toLowerCase() === 'running') {
      dbRunning.push(item);
    } else {
      dbWaiting.push(item);
    }
  });

  // Grab StatefulSet by state
  const tangoStatefulSets = (statefulSets || []).filter(
    item =>
      ['DeviceServerController', 'DatabaseDSController'].indexOf(
        item?.jsonData?.metadata?.labels?.['app.kubernetes.io/managed-by'] || null
      ) > -1
  );
  const tangoStatefulSetsRunning = tangoStatefulSets.filter(item => {
    return (
      item?.jsonData?.status &&
      item.jsonData.status?.replicas === item.jsonData.status?.readyReplicas
    );
  });

  return (
    <>
      <Grid container justifyContent="flex-start" alignItems="stretch" paddingTop={8} spacing={4}>
        <Grid item xs={12}>
          <TangoOperatorInfo crdVersion={crdVersion} />
        </Grid>
        {/* DeviceServer */}
        <Grid item xs={12} sm={6} lg={3}>
          {!deviceServers && <Loader />}
          {deviceServers && (
            <TileChart
              data={[
                {
                  name: 'ok',
                  value: devServerRunning.length,
                },
                {
                  name: 'waiting',
                  value: devServerWaiting.length,
                  fill: theme.palette.warning.main,
                },
              ]}
              total={devServerTotalNum}
              title={'Device Servers'}
              label={percentage(devServerRunning.length, devServerTotalNum)}
              legend={
                <>
                  {devServerWaiting.length} Waiting/{devServerRunning.length} Running
                  <p>{devServerTotalNum} Total</p>
                </>
              }
            />
          )}
        </Grid>
        {/* DatabaseDs */}
        <Grid item xs={12} sm={6} lg={3}>
          {!databaseDs && <Loader />}
          {databaseDs && (
            <TileChart
              data={[
                {
                  name: 'ok',
                  value: dbRunning.length,
                },
                {
                  name: 'waiting',
                  value: dbWaiting.length,
                  fill: theme.palette.warning.main,
                },
              ]}
              total={dbTotalNum}
              title={'Database DS'}
              label={percentage(dbRunning.length, dbTotalNum)}
              legend={
                <>
                  {dbWaiting.length} Waiting/{dbRunning.length} Running<p>{dbTotalNum} Total</p>
                </>
              }
            />
          )}
        </Grid>
        {/* StatefulSet */}
        <Grid item xs={12} sm={6} lg={3}>
          {!statefulSets && <Loader />}
          {statefulSets && (
            <TileChart
              data={[
                {
                  name: 'running',
                  value: tangoStatefulSetsRunning.length,
                },
                {
                  name: 'failing',
                  value: tangoStatefulSets.length - tangoStatefulSetsRunning.length,
                  fill: theme.palette.error.main,
                },
              ]}
              total={tangoStatefulSets.length}
              title={'StatefulSets'}
              label={percentage(tangoStatefulSetsRunning.length, tangoStatefulSets.length)}
              legend={
                <>
                  {tangoStatefulSetsRunning.length}/{tangoStatefulSets.length} Running
                </>
              }
            />
          )}
        </Grid>
        {/* Devices */}
        <Grid item xs={12} sm={6} lg={3}>
          {!deviceServers && <Loader />}
          {deviceServers && (
            <TileChart
              data={[
                {
                  name: 'ok',
                  value: devicesRunningNum,
                },
                {
                  name: 'failing',
                  value: devicesTotalNum - devicesRunningNum,
                  fill: theme.palette.error.main,
                },
              ]}
              total={devicesTotalNum}
              title={'Devices'}
              label={percentage(devicesRunningNum, devicesTotalNum)}
              legend={`${devicesRunningNum}/${devicesTotalNum} Running`}
            />
          )}
        </Grid>
      </Grid>
      <br />
      <DeviceServersList namespace={null} resourceClass={deviceServersResourceClass} />
    </>
  );

  function percentage(value, total): string {
    return value >= 0 && total > 0 ? `${Number((value / total) * 100).toFixed(0)}%` : 'None';
  }
}
