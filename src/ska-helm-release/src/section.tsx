import { K8s } from '@kinvolk/headlamp-plugin/lib';
import {
  SectionBox,
  SimpleTable,
  StatusLabel,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { amber, green, orange } from '@mui/material/colors';
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
import { Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { Chip } from '@mui/material';
import { styled } from '@mui/system';
import { SvgDanger } from './icons';
import { CarProxy } from './nexus';

const PaddedChip = styled(Chip)({
  paddingTop: '2px',
  paddingBottom: '2px',
});

const useStyles = makeStyles({
  tooltip: {
    fontSize: '0.8em',
  },
});

function getReleaseTooltip(dependency: HelmReleaseDependency) {
  if (!dependency.error && !dependency.hasVersionInfo) {
    if (dependency.repository.startsWith('file://')) {
      return (
        <>
          {dependency.repository}
          <br />* Dependency local to the installed chart
        </>
      );
    }

    return '* ERROR: Unable to fetch chart information';
  }

  return dependency.error ? (
    <>
      {dependency.repository}
      <br />* ERROR: {dependency.error}
    </>
  ) : (
    <>
      {dependency.repository}
      <br />* Latest Version: {dependency.latestVersion || dependency.version}
    </>
  );
}

export default function HelmRelease(props: HelmReleaseProps) {
  const [releases, setHelmReleases] = useState([]);
  const [carProxyInfo, setCarProxyInfo] = useState<CarProxy | null>(null);
  const styles = useStyles();

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
        props.namespace.jsonData.metadata.name,
        carProxyInfo
      );
      setHelmReleases(data);
    }

    getHelmReleases();
  }, [props, carProxyInfo]);

  const defaultColumns = [
    {
      label: 'Name',
      gridTemplate: 1,
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
        return element.timestamp;
      },
    },
    {
      label: 'Chart',
      gridTemplate: 1,
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
          </Grid>
        );
      },
    },
    {
      label: 'Dependencies',
      gridTemplate: 3,
      getter: element => {
        if (!element.chartDependencies || element.chartDependencies.length === 0) {
          return <></>;
        }

        return (
          <Grid container direction="column" alignItems="start" spacing={1} size="grow">
            {element.chartDependencies?.map(dependency => (
              <Grid item>
                <Grid container direction="row" alignItems="start" spacing={1} columns={2}>
                  <Tooltip
                    classes={{ tooltip: styles.tooltip }}
                    title={getReleaseTooltip(dependency)}
                  >
                    <Grid item>
                      <PaddedChip
                        icon={dependency.error ? <SvgDanger></SvgDanger> : null}
                        label={
                          <>
                            {dependency.name} <strong>{dependency.version}</strong>
                          </>
                        }
                        size="small"
                        sx={
                          dependency.error || dependency.hasVersionInfo
                            ? dependency.error
                              ? { backgroundColor: orange[700] }
                              : dependency.latestVersion
                              ? { backgroundColor: amber[600] }
                              : { backgroundColor: green[500] }
                            : null
                        }
                      />
                    </Grid>
                  </Tooltip>
                  {dependency.latestVersion && (
                    <Grid item>
                      <PaddedChip
                        label={
                          <>
                            <strong>{dependency.latestVersion}</strong> available!
                          </>
                        }
                        variant="outlined"
                        size="small"
                        color="success"
                      />
                    </Grid>
                  )}
                </Grid>
              </Grid>
            ))}
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
      {releases && releases.length > 0 && (
        <SectionBox title={'Releases'}>
          <SimpleTable columns={defaultColumns} data={releases} />
        </SectionBox>
      )}
    </>
  );
}
