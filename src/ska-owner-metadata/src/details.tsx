import {
  MetadataDictGrid,
  NameValueTable,
  NameValueTableRow,
  StatusLabel,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/lib/k8s/cluster';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Grid, IconButton, Tooltip } from '@mui/material';
import { Link as MUILink } from '@mui/material';
import { SvgGitlab } from './icons';
import { capitalizeFirstLetter, getRouteUrl } from './utils';

export interface OwnershipDetailsProps {
  resource: KubeObject;
}

const useStyles = makeStyles({
  tooltip: {
    fontSize: '0.8em',
  },
});

function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

export function OwnershipDetails(props: OwnershipDetailsProps) {
  const { resource } = props;
  const resourceLabels = resource.jsonData.metadata.labels || {};
  const resourceAnnotations = resource.jsonData.metadata.annotations || {};

  const teamBase: string = resourceLabels['cicd.skao.int/team'] || '';
  const team = teamBase.length > 0 ? teamBase : null;
  const author: string = resourceLabels['cicd.skao.int/author'] || null;
  const authorUrl = author ? `https://gitlab.com/${author}` : null;
  const project: string = resourceLabels['cicd.skao.int/project'] || null;
  const branch: string = resourceLabels['cicd.skao.int/branch'] || null;
  const mrAssignees: string = resourceAnnotations['cicd.skao.int/mrAssignees'] || null;
  const commit: string = resourceLabels['cicd.skao.int/commit'] || null;
  const pipelineUrl: string = resourceAnnotations['cicd.skao.int/pipelineUrl'] || null;
  const jobUrl: string = resourceAnnotations['cicd.skao.int/jobUrl'] || null;

  const namespace_status: string = resourceAnnotations['manager.cicd.skao.int/status'] || null;
  const namespace_status_timestamp: string =
    resourceAnnotations['manager.cicd.skao.int/status_timestamp'] || null;
  const namespace_status_finalize: string =
    resourceAnnotations['manager.cicd.skao.int/status_finalize_at'] || null;

  const namespace_status_terms = [];
  if (namespace_status_timestamp) {
    namespace_status_terms.push(<p>Since: {namespace_status_timestamp}</p>);
  }

  if (namespace_status_finalize) {
    namespace_status_terms.push(<p>Finalize At: {namespace_status_finalize}</p>);
  }

  const mrAssigneesDict = mrAssignees
    ? mrAssignees.split(',').reduce((acc, curr) => {
        acc[curr] = curr;
        return acc;
      }, {} as Record<string, string>)
    : {};

  const styles = useStyles();

  const mainRows = [
    {
      name: 'Status',
      value: namespace_status && (
        <StatusLabel
          status={
            ['ok'].indexOf(namespace_status) > -1
              ? 'success'
              : ['unstable', 'failing'].indexOf(namespace_status) > -1
              ? 'warning'
              : 'error'
          }
        >
          {capitalizeFirstLetter(namespace_status)}
        </StatusLabel>
      ),
      hide: !namespace_status,
    },
    {
      name: <p>Status Info</p>,
      value: namespace_status_terms.length > 0 && <>{namespace_status_terms}</>,
      hide: namespace_status_terms.length === 0,
    },
    {
      name: 'Project',
      value: project && (
        <MUILink href={getRouteUrl(`/projects/:name`, { name: project })}>{project}</MUILink>
      ),
      hide: !project,
    },
    {
      name: 'Team',
      value: team && <MUILink href={getRouteUrl(`/teams/:name`, { name: team })}>{team}</MUILink>,
      hide: !team,
    },
    {
      name: <p>User</p>,
      value: author && (
        <Grid container justifyContent="space-between" alignItems="center">
          <MUILink href={getRouteUrl(`/users/:name`, { name: author })}>{author}</MUILink>
          <Tooltip classes={{ tooltip: styles.tooltip }} title={`${author} Gitlab profile`}>
            <IconButton href={authorUrl} aria-label="user_profile">
              <SvgGitlab />
            </IconButton>
          </Tooltip>
        </Grid>
      ),
      hide: !author,
    },
    {
      name: 'Branch',
      value: branch,
      hide: !branch,
    },
    {
      name: 'Commit',
      value: commit,
      hide: !commit,
    },
    {
      name: 'Merge Request Assignees',
      value: mrAssignees && <MetadataDictGrid showKeys={false} dict={mrAssigneesDict} />,
      hide: isEmpty(mrAssigneesDict),
    },
    {
      name: 'Pipeline',
      value: pipelineUrl && (
        <MUILink href={pipelineUrl} underline="hover">
          {pipelineUrl}
        </MUILink>
      ),
      hide: !pipelineUrl,
    },
    {
      name: 'Job',
      value: jobUrl && (
        <MUILink href={jobUrl} underline="hover">
          {jobUrl}
        </MUILink>
      ),
      hide: !jobUrl,
    },
  ] as NameValueTableRow[];

  return (
    <Box>
      <NameValueTable rows={mainRows} />
    </Box>
  );
}
