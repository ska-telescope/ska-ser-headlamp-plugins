import { K8s } from '@kinvolk/headlamp-plugin/lib';
import {
  SectionBox,
  SimpleTable,
  StatusLabel,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { useEffect, useState } from 'react';
import { fetchHelmReleases, HelmReleaseData } from './request';
import { capitalizeFirstLetter, stringCompare } from './utils';

export interface HelmReleaseProps {
  namespace: K8s.ResourceClasses.Namespace;
}

import { Grid } from '@material-ui/core';
import { Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { Chip } from '@mui/material';
import { styled } from '@mui/system';

const PaddedChip = styled(Chip)({
  paddingTop: '2px',
  paddingBottom: '2px',
});

const useStyles = makeStyles({
  tooltip: {
    fontSize: '0.8em',
  },
});

export default function HelmRelease(props: HelmReleaseProps) {
  const [releases, setHelmReleases] = useState([]);

  const styles = useStyles();

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
                variant="outlined"
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
                    title={
                      dependency.latestVersion
                        ? `${dependency.repository}\nLatest Version: ${dependency.latestVersion}`
                        : dependency.repository
                    }
                  >
                    <Grid item>
                      <PaddedChip
                        label={
                          <>
                            {dependency.name} <strong>{dependency.version}</strong>
                          </>
                        }
                        variant="outlined"
                        size="small"
                        color={dependency.latestVersion ? 'warning' : 'success'}
                      />
                    </Grid>
                  </Tooltip>
                  {dependency.latestVersion && (
                    <Grid item>
                      <PaddedChip
                        label={<strong>{dependency.latestVersion} available!</strong>}
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
