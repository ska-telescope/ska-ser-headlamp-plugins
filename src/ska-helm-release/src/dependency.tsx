import { Loader } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Grid, makeStyles, Tooltip } from '@material-ui/core';
import { Chip } from '@mui/material';
import { Link } from '@mui/material';
import { amber, green, orange } from '@mui/material/colors';
import { styled } from '@mui/system';
import { useEffect, useState } from 'react';
import { SvgDanger, SvgExternal, SvgLocal } from './icons';
import { CarProxy } from './nexus';
import { fetchLatestVersionInfo, HelmReleaseDependency } from './request'; // You'll need to implement this function
import { compareVersions } from './utils';

const PaddedChip = styled(Chip)({
  paddingTop: '2px',
  paddingBottom: '2px',
});

const useStyles = makeStyles({
  tooltip: {
    fontSize: '0.8em',
  },
});

export function HelmChartUrlWrapper({ children, dependency }) {
  return !dependency.local && !dependency.external ? (
    <Link href={`https://artefact.skao.int/#browse/browse:helm-internal:${dependency.name}`}>
      {children || dependency.name}
    </Link>
  ) : (
    children
  );
}

export interface DependencyItemProps {
  dependency: HelmReleaseDependency;
  carProxy: CarProxy;
}

function getReleaseTooltip(dependency: HelmReleaseDependency) {
  const latestVersionInfo = dependency.latestVersionInfo;
  if (!latestVersionInfo && !dependency) {
    return '* ERROR: Unable to fetch chart information';
  }

  if (!latestVersionInfo) {
    if (dependency.local) {
      return (
        <>
          {dependency.repository}
          <br />* Dependency local to the installed chart
        </>
      );
    }

    if (!dependency.repository.includes('artefact.skao.int')) {
      return (
        <>
          {dependency.repository}
          <br />* External dependency
        </>
      );
    }

    return '* ERROR: Unable to fetch chart information';
  }

  return latestVersionInfo.error ? (
    <>
      {dependency.repository}
      <br />* ERROR: {latestVersionInfo.error}
    </>
  ) : (
    <>
      {dependency.repository}
      <br />* Latest Version: {latestVersionInfo.version}
    </>
  );
}

export function DependencyItem(props: DependencyItemProps) {
  const dependency = props.dependency;
  const [latestVersionInfo, setLatestVersionInfo] = useState(dependency.latestVersionInfo);
  const styles = useStyles();

  function getDepedencyIcon(depedency: HelmReleaseDependency) {
    if (!latestVersionInfo) {
      return dependency.local ? <SvgLocal /> : dependency.external ? <SvgExternal /> : null;
    }

    if (latestVersionInfo?.error) {
      return <SvgDanger />;
    }

    return null;
  }

  useEffect(() => {
    if (!latestVersionInfo) {
      (async () => {
        try {
          const info = await fetchLatestVersionInfo(
            dependency.repository,
            dependency.name,
            props.carProxy
          );
          setLatestVersionInfo(info);
        } catch (error) {
          setLatestVersionInfo(null);
        }
      })();
    }
  }, [dependency]);

  return (
    <Grid container direction="row" alignItems="center" spacing={1}>
      <Tooltip
        classes={{ tooltip: styles.tooltip }}
        title={getReleaseTooltip({ ...dependency, latestVersionInfo })}
      >
        <Grid item>
          <HelmChartUrlWrapper dependency={dependency}>
            <PaddedChip
              icon={getDepedencyIcon(dependency)}
              label={
                <>
                  {dependency.name} <strong>{dependency.version}</strong>
                </>
              }
              size="small"
              sx={
                latestVersionInfo
                  ? latestVersionInfo.error
                    ? { backgroundColor: orange[700] }
                    : compareVersions(latestVersionInfo.version, dependency.version) ===
                      dependency.version
                    ? { backgroundColor: green[500] }
                    : { backgroundColor: amber[600] }
                  : null
              }
            />
          </HelmChartUrlWrapper>
        </Grid>
      </Tooltip>
      {!dependency.local && !dependency.external && !latestVersionInfo && (
        <Grid item>
          <Loader size={'0.5em'} noContainer />
        </Grid>
      )}
      {latestVersionInfo &&
        compareVersions(latestVersionInfo.version, dependency.version) !== dependency.version && (
          <Grid item>
            <PaddedChip
              label={
                <>
                  <strong>{latestVersionInfo.version}</strong> available!
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
}
