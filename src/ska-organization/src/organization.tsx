import { K8s } from '@kinvolk/headlamp-plugin/lib';
import {
  Loader,
  PageGrid,
  SectionBox,
  TileChart,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { useTheme } from '@mui/material';
import { Grid } from '@mui/material';
import { mostFrequentString } from './utils';

export function Organization() {
  const theme = useTheme();
  const [namespaces, error]: [K8s.ResourceClasses.Namespace[], any] =
    K8s.ResourceClasses.Namespace.useList();
  if (error) {
    console.error('Failed to fetch namespaces:', error);
  }

  const cicdNamespaces = Array.from(
    new Set(
      namespaces
        ?.filter(item => (item.jsonData.metadata?.labels?.['cicd.skao.int/jobId'] || null) !== null)
        .map(item => item.jsonData)
    )
  );

  const namespaceTeams = cicdNamespaces
    ?.filter(item => (item.metadata?.labels?.['cicd.skao.int/team'] || null) !== null)
    .map(item => item.metadata?.labels?.['cicd.skao.int/team']);
  const namespaceProjects = cicdNamespaces
    ?.filter(item => (item.metadata?.labels?.['cicd.skao.int/project'] || null) !== null)
    .map(item => item.metadata?.labels?.['cicd.skao.int/project']);
  const namespaceUsers = cicdNamespaces
    ?.filter(item => (item.metadata?.labels?.['cicd.skao.int/author'] || null) !== null)
    .map(item => item.metadata?.labels?.['cicd.skao.int/author']);

  const totalNamespaces = cicdNamespaces?.length;
  const persistentNamespaces = cicdNamespaces?.filter(
    item => !item.metadata?.name.startsWith('ci-')
  ).length;
  const ciNamespaces = totalNamespaces - persistentNamespaces;

  const managedNamespaces = cicdNamespaces?.filter(
    item => (item.metadata?.annotations?.['manager.cicd.skao.int/status'] || null) !== null
  );
  const successfulNamespaces =
    managedNamespaces.length -
    managedNamespaces?.filter(
      item =>
        ['unstable', 'failing', 'failed'].indexOf(
          item.metadata?.annotations?.['manager.cicd.skao.int/status'] || null
        ) > -1
    ).length;

  return (
    <PageGrid>
      <SectionBox title="SKAO Organization" textAlign="center" paddingTop={2}>
        {!namespaces && <Loader />}
        {namespaces && (
          <Grid
            container
            justifyContent="flex-start"
            alignItems="stretch"
            paddingTop={8}
            spacing={4}
          >
            {/* TOTALS */}
            <Grid item xs={12} sm={4}>
              <TileChart title={'Teams'} legend={Array.from(new Set(namespaceTeams)).length} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TileChart
                title={'Projects'}
                legend={Array.from(new Set(namespaceProjects)).length}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TileChart title={'Users'} legend={Array.from(new Set(namespaceUsers)).length} />
            </Grid>
            {/* RATIOS */}
            <Grid item xs={12} sm={4}>
              <TileChart
                data={[
                  {
                    name: 'persistent',
                    value: persistentNamespaces,
                  },
                ]}
                total={totalNamespaces}
                title={'Persistent Namespaces'}
                label={
                  persistentNamespaces >= 0 && totalNamespaces > 0
                    ? `${Number((persistentNamespaces / totalNamespaces) * 100).toFixed(0)}%`
                    : 'None'
                }
                legend={`${persistentNamespaces}/${totalNamespaces}`}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TileChart
                data={[
                  {
                    name: 'ci',
                    value: ciNamespaces,
                  },
                ]}
                total={totalNamespaces}
                title={'CI Namespaces'}
                label={
                  ciNamespaces >= 0 && totalNamespaces > 0
                    ? `${Number((ciNamespaces / totalNamespaces) * 100).toFixed(0)}%`
                    : 'None'
                }
                legend={`${ciNamespaces}/${totalNamespaces}`}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TileChart
                data={[
                  {
                    name: 'ok',
                    value: successfulNamespaces,
                  },
                  {
                    name: 'failing',
                    value: managedNamespaces.length - successfulNamespaces,
                    fill: theme.palette.error.main,
                  },
                ]}
                total={managedNamespaces.length}
                title={'Successful Namespaces'}
                label={
                  managedNamespaces.length > 0
                    ? `${Number((successfulNamespaces / managedNamespaces.length) * 100).toFixed(
                        0
                      )}%`
                    : 'None'
                }
                legend={`${successfulNamespaces}/${managedNamespaces.length}`}
              />
            </Grid>
            {/* MOST */}
            <Grid item xs={12} sm={4}>
              <TileChart title="Top Team" legend={<p>{mostFrequentString(namespaceTeams)}</p>} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TileChart
                title="Top Project"
                legend={<p>{mostFrequentString(namespaceProjects)}</p>}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TileChart title="Top User" legend={<p>{mostFrequentString(namespaceUsers)}</p>} />
            </Grid>
          </Grid>
        )}
      </SectionBox>
    </PageGrid>
  );
}
