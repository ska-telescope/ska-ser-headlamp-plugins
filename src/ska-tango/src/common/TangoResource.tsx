import { K8s } from '@kinvolk/headlamp-plugin/lib';
import {
  DetailsGrid,
  Link,
  Loader,
  OwnedPodsSection,
  StatusLabel as RStatusLabel,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import {
  KubeMetadata,
  KubeObject,
  KubeObjectInterface,
} from '@kinvolk/headlamp-plugin/lib/lib/k8s/cluster';
import { Grid } from '@material-ui/core';
import { Box } from '@material-ui/core';
import { Paper } from '@mui/material';
import React, { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { getHarborUrl } from '../utils';
import { ChipLabel } from './ChipLabel';
import StatusLabel from './StatusLabel';

export interface TangoResourceDetailedViewProps {
  resourceType: string;
  extraInfo?: (item: any) => { name: string; value: any }[];
  extraSections?: (item: any) => { id: string; section: any }[];
  actions?: (resource: KubeObject | null) => ReactNode[];
  children?: ReactNode | ReactNode[];
}

interface TangoResourceDetailProps {
  resourceType: string;
  resourceClass: any;
  name: string;
  namespace: string;
  extraInfo?: (item: any) => { name: string; value: any }[];
  extraSections?: (item: any) => { id: string; section: any }[];
  actions?: (resource: KubeObject | null) => ReactNode[];
  children?: ReactNode | ReactNode[];
}

function StatefulSetImage({ statefulSet }) {
  if (statefulSet === undefined || !statefulSet?.jsonData) {
    return <></>;
  }

  const statefulSetContainers = statefulSet.jsonData.spec.template.spec.containers || [];
  const containers = ['ds', 'tangodb', 'deviceserver'];
  const tangoContainers = statefulSetContainers.filter(item => containers.indexOf(item.name) > -1);
  if (tangoContainers.length === 0) {
    return <></>;
  }

  const [repository, tag] = tangoContainers[0].image.split(':');
  const image = repository.split('/').at(-1);
  let url;

  if (repository.includes('artefact.skao.int')) {
    url = getHarborUrl(image);
  }

  return (
    <Paper sx={{ padding: '6px' }}>
      <ChipLabel label={image} value={tag} url={url} urlOnLabel />
    </Paper>
  );
}

function StatefulSetStatus({ statefulSet, namespace }) {
  const statefulSetName = statefulSet.jsonData.metadata.name;
  let status = 'Running';
  if (statefulSet.jsonData.status.replicas === 0) {
    status = 'Paused';
  } else {
    if (statefulSet.jsonData.status.replicas !== statefulSet.jsonData.status.readyReplicas) {
      status = 'Failing';
    }
  }
  const statusLabel = status === 'Running' ? 'success' : status === 'Failing' ? 'error' : 'warning';

  return (
    <Paper sx={{ padding: '6px' }}>
      <Box display="flex" alignItems="center">
        <Box mr={1}>
          <Link routeName="StatefulSet" params={{ namespace: namespace, name: statefulSetName }}>
            {statefulSetName}
          </Link>
        </Box>
        <Box>
          <RStatusLabel status={statusLabel}>{status}</RStatusLabel>
        </Box>
      </Box>
    </Paper>
  );
}

function StatefulSetStatuses({ statefulSets, namespace }) {
  if (statefulSets === undefined || statefulSets?.length === 0) {
    return <span>-</span>;
  }

  return (
    <Grid container spacing={1} justifyContent="flex-start">
      <Grid
        container
        item
        justifyContent="flex-start"
        spacing={1}
        style={{
          maxWidth: '80%',
        }}
      >
        {statefulSets.map(item => {
          return (
            <Grid key={item.jsonData?.metadata?.uid} item zeroMinWidth>
              <StatefulSetStatus statefulSet={item} namespace={namespace} />
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  );
}

export default function TangoResourceDetailedView(props: TangoResourceDetailedViewProps) {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [resource] = K8s.ResourceClasses?.CustomResourceDefinition?.useGet(
    `${props.resourceType}.tango.tango-controls.org`
  );
  const resourceClass = React.useMemo(() => {
    return resource?.makeCRClass();
  }, [resource]);

  return (
    <TangoResourceDetail
      {...props}
      name={name}
      namespace={namespace}
      resourceClass={resourceClass}
    ></TangoResourceDetail>
  );
}

function TangoResourceDetail(props: TangoResourceDetailProps) {
  const [statefulSets] = K8s.ResourceClasses.StatefulSet.useList({
    namespace: props.namespace,
    labelSelector: `app.kubernetes.io/instance=${props.name}`,
  });

  const defaultExtraInfo = item => {
    return [
      {
        name: 'Status',
        value: <StatusLabel item={item} />,
      },
      {
        name: 'Stateful Sets',
        value: (
          <>
            {!statefulSets && <Loader size={'0.5rem'} noContainer />}
            {statefulSets && (
              <StatefulSetStatuses statefulSets={statefulSets} namespace={props.namespace} />
            )}
          </>
        ),
      },
      {
        name: 'Images',
        value: (
          <>
            {!statefulSets && <Loader size={'0.5rem'} noContainer />}
            {statefulSets && (
              <Grid container spacing={1} justifyContent="flex-start">
                <Grid
                  container
                  item
                  justifyContent="flex-start"
                  spacing={1}
                  style={{
                    maxWidth: '80%',
                  }}
                >
                  {statefulSets.map(item => {
                    return (
                      <Grid key={item.jsonData?.metadata?.uid} item zeroMinWidth>
                        <StatefulSetImage statefulSet={item} />
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>
            )}
          </>
        ),
      },
    ];
  };

  const targetOwnerMetadata = {
    namespace: props.namespace,
  } as KubeMetadata;

  const targetOwner = {
    kind: 'StatefulSet',
    metadata: targetOwnerMetadata,
    spec: {
      selector: {
        matchLabels: {
          'app.kubernetes.io/instance': props.name,
        },
      },
    },
  } as KubeObjectInterface;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const defaultExtraSections = _item => {
    return [
      {
        id: 'headlamp.tango-resource-owned-pods',
        section: <OwnedPodsSection noSearch resource={targetOwner} />,
      },
    ];
  };

  const defaultActions = _item => {
    return [];
  };

  const extraInfo = item => {
    const extraInfoList = [];
    if (defaultExtraInfo) {
      extraInfoList.push(...defaultExtraInfo(item));
    }

    if (props.extraInfo) {
      extraInfoList.push(...props.extraInfo(item));
    }

    return extraInfoList;
  };

  const extraSections = item => {
    const extraSectionsList = [];
    if (defaultExtraSections) {
      extraSectionsList.push(...defaultExtraSections(item));
    }

    if (props.extraSections) {
      extraSectionsList.push(...props.extraSections(item));
    }

    return extraSectionsList;
  };

  const actions = item => {
    const actionsList = [];
    if (defaultActions) {
      actionsList.push(...defaultActions(item));
    }

    if (props.actions) {
      actionsList.push(...props.actions(item));
    }

    return actionsList;
  };

  return (
    <>
      {!props.resourceClass && <Loader />}
      {props.children && props.children}
      {props.resourceClass && (
        <DetailsGrid
          resourceType={props.resourceClass}
          name={props.name}
          namespace={props.namespace}
          withEvents
          extraInfo={extraInfo}
          extraSections={extraSections}
          actions={actions}
        />
      )}
    </>
  );
}
