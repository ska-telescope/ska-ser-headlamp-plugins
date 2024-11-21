import { K8s } from '@kinvolk/headlamp-plugin/lib';
import {
  DateLabel,
  SectionBox,
  SimpleTable,
  StatusLabel,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { useEffect, useState } from 'react';
import {
  fetchHelmReleases,
  HelmReleaseData,
  HelmReleaseDependency,
  isCARProxyInstalled,
} from './request';
import { capitalizeFirstLetter, stringCompare } from './utils';

export interface HelmReleaseProps {
  namespace: K8s.ResourceClasses.Namespace;
}

import { Grid } from '@material-ui/core';
import { Chip } from '@mui/material';
import { styled } from '@mui/system';
import { DependencyItem } from './dependency';
import { CarProxy } from './nexus';

const PaddedChip = styled(Chip)({
  paddingTop: '2px',
  paddingBottom: '2px',
});

export default function HelmRelease(props: HelmReleaseProps) {
  const [releases, setHelmReleases] = useState([]);
  const [carProxyInfo, setCarProxyInfo] = useState<CarProxy | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [isInstalled, serviceName, namespace] = await isCARProxyInstalled();
        if (isInstalled) {
          setCarProxyInfo({ serviceName, serviceNamespace: namespace });
        } else {
          setCarProxyInfo(null);
        }
      } catch (e) {
        setCarProxyInfo(null);
        return;
      }
    })();
  }, [props]);

  useEffect(() => {
    async function getHelmReleases() {
      const data: HelmReleaseData[] = await fetchHelmReleases(
        props.namespace.jsonData.metadata.name
      );
      setHelmReleases(data);
    }

    getHelmReleases();
  }, [props]);

  const defaultColumns = [
    {
      label: 'Name',
      gridTemplate: 'min-content',
      getter: element => {
        return (
          <Grid container justifyContent="space-between" alignItems="center" spacing={1}>
            <span>{element.name}</span>
            <Grid item>
              <PaddedChip label={`v${element.version}`} variant="outlined" size="small" />
            </Grid>
          </Grid>
        );
      },
      sort: stringCompare,
    },
    {
      label: 'Creation',
      gridTemplate: 'min-content',
      getter: element => {
        return <DateLabel date={new Date(element.timestamp).getTime()} format="mini" />;
      },
    },
    {
      label: 'Updated',
      gridTemplate: 'min-content',
      getter: element => {
        return <DateLabel date={new Date(element.updatedTimestamp).getTime()} format="mini" />;
      },
    },
    {
      label: 'Chart',
      gridTemplate: 'min-content',
      getter: element => {
        return element.chart;
      },
    },
    {
      label: 'Version',
      gridTemplate: 'min-content',
      getter: element => {
        return (
          <Grid container direction="column" columns={1} alignItems="start" spacing={1}>
            <Grid item>
              <PaddedChip
                label={
                  <span>
                    <strong>Chart</strong>: {element.chartVersion}
                  </span>
                }
                size="small"
              />
            </Grid>
            <Grid item>
              <PaddedChip
                label={
                  <span>
                    <strong>App</strong>: {element.appVersion}
                  </span>
                }
                variant="outlined"
                size="small"
              />
            </Grid>
            {element?.latestVersionInfo && (
              <Grid item>
                <PaddedChip
                  label={
                    <>
                      <strong>{element.latestVersionInfo.version}</strong> available!
                    </>
                  }
                  variant="outlined"
                  size="small"
                  color="success"
                />
              </Grid>
            )}
          </Grid>
        );
      },
    },
    {
      label: 'Dependencies',
      getter: element => {
        if (!element.dependencies || element.dependencies.length === 0) {
          return <></>;
        }

        const dependencies = element.dependencies as HelmReleaseDependency[];
        return (
          <Grid container direction="column" alignItems="start" spacing={1} size="grow">
            {dependencies
              ?.filter(dep => !dep.indirect)
              .map(
                dependency =>
                  carProxyInfo && (
                    <Grid item key={dependency.name}>
                      <DependencyItem dependency={dependency} carProxy={carProxyInfo} />
                    </Grid>
                  )
              )}
          </Grid>
        );
      },
    },
    {
      label: 'Indirect Dependencies',
      getter: element => {
        if (!element.dependencies || element.dependencies.length === 0) {
          return <></>;
        }

        const dependencies = element.dependencies as HelmReleaseDependency[];
        return (
          <Grid container direction="column" alignItems="start" spacing={1} size="grow">
            {dependencies
              ?.filter(dep => dep.indirect)
              .map(
                dependency =>
                  carProxyInfo && (
                    <Grid item key={dependency.name}>
                      <DependencyItem dependency={dependency} carProxy={carProxyInfo} />
                    </Grid>
                  )
              )}
          </Grid>
        );
      },
    },
    {
      label: 'Status',
      gridTemplate: 'min-content',
      getter: element => {
        return (
          <StatusLabel status={element.status === 'deployed' ? 'success' : 'error'}>
            {capitalizeFirstLetter(element.status)}
          </StatusLabel>
        );
      },
    },
  ];

  return (
    <>
      <SectionBox title={'Releases'}>
        <SimpleTable columns={defaultColumns} data={releases} />
      </SectionBox>
    </>
  );
}
