import '@xyflow/react/dist/style.css';
import Dagre from '@dagrejs/dagre';
import { Icon } from '@iconify/react';
import { K8s } from '@kinvolk/headlamp-plugin/lib';
import { ActionButton, ButtonStyle, Dialog } from '@kinvolk/headlamp-plugin/lib/components/common';
import { KubeCRD } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';
import { KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/lib/k8s/KubeObject';
import Typography from '@material-ui/core/Typography';
import { DialogActions, DialogContent } from '@mui/material';
import { useTheme } from '@mui/material';
import { Box, Paper } from '@mui/material';
import Button from '@mui/material/Button';
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import md5 from 'md5';
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { DatabaseDsNode, DeviceServerNode } from './deviceNodes';
import { getThemeName } from './utils';

export interface DependencyMapActionProps {
  namespace: K8s.ResourceClasses.Namespace;
  buttonStyle?: ButtonStyle;
  resourceClass?: KubeCRD;
}

export interface DependencyMapProps {
  namespace: K8s.ResourceClasses.Namespace;
  deviceServers: KubeObjectInterface[];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  title?: string;
}

function hashStrings(source, dest) {
  return md5(source + dest);
}

const getDeviceServerGraph = (deviceServers: KubeObjectInterface[], edgeColor: any) => {
  const nodes = [];
  const edges = [];

  deviceServers.forEach(item => {
    const dependencies = item?.spec?.dependsOn || [];
    const devices = item?.status?.devices || [];
    const deviceNames = devices.map(device => device.name);

    devices.forEach(device => {
      nodes.push({
        id: device.name,
        data: { label: device.name, deviceServer: item.status, device: device },
        type: 'deviceServer',
      });
    });

    dependencies.forEach(dependency => {
      deviceNames.forEach(device => {
        edges.push({
          id: `e${hashStrings(dependency, device)}`,
          source: dependency,
          target: device,
          animated: dependency.includes('sys/database'),
          markerStart: {
            type: MarkerType.ArrowClosed,
          },
          style: {
            stroke: edgeColor,
            strokeWidth: dependency.includes('sys/database') ? 1 : 2,
          },
        });
      });
    });
  });

  return [nodes, edges];
};

const getLayoutedElements = (nodes, edges, options) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction, ranksep: 400, marginx: 100, marginy: 100 });

  edges.forEach(edge => g.setEdge(edge.source, edge.target));
  nodes.forEach(node =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    })
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map(node => {
      const position = g.node(node.id);
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;
      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

function Legend() {
  const legendItems = [
    { symbol: 'mdi:dots-horizontal', label: 'DatabaseDS Dependency' },
    { symbol: 'mdi:minus', label: 'Device Dependency' },
    { symbol: 'mdi:square-rounded-outline', label: 'DeviceServer Status' },
    { symbol: 'mdi:broadcast', label: 'Device State' },
    { symbol: 'mdi:arrow-left', label: 'Depends On' },
  ];

  return (
    <Paper
      sx={{
        ml: 2,
        mt: 2,
        p: '4px',
        display: 'inline-block',
        fontSize: '0.875rem',
        width: 'auto',
        zIndex: 10,
        position: 'relative',
      }}
    >
      {legendItems.map((item, index) => (
        <Box key={index} display="flex" alignItems="center" gap={1}>
          <Icon icon={item.symbol} width={16} height={16} />
          <Typography sx={{ fontSize: '0.6rem' }} variant="caption">
            {item.label}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
}

export function DeviceDependencyMap(props: DependencyMapProps) {
  const themeName = getThemeName();
  const theme = useTheme();
  const dialogTitle =
    props.title ||
    `Device Dependency Map: ${props.namespace?.jsonData?.metadata.name || 'Unknown'}`;
  const nodeTypes = useMemo(
    () => ({
      databaseDs: DatabaseDsNode,
      deviceServer: DeviceServerNode,
    }),
    []
  );
  const [isFullScreen, setFullScreen] = useState(false);
  const defaultNodes = useMemo(
    () => [
      {
        id: 'sys/database/2',
        data: { label: 'sys/database/2' },
        position: { x: 0, y: 0 },
        type: 'databaseDs',
      },
    ],
    []
  );
  const defaultEdges = useMemo(() => [], []);
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const primaryTextColor = theme.palette.text.primary;
  const isInitialLayoutDone = useRef(false);

  useEffect(() => {
    if (props?.deviceServers?.length > 0) {
      const [dsNodes, dsEdges] = getDeviceServerGraph(props.deviceServers, primaryTextColor);
      if (!isInitialLayoutDone.current) {
        const layouted = getLayoutedElements(dsNodes, dsEdges, { direction: 'LR' });
        setNodes([...defaultNodes, ...layouted.nodes]);
        setEdges([...defaultEdges, ...layouted.edges]);
        setTimeout(() => fitView({ includeHiddenNodes: true, duration: 500 }), 200);
        isInitialLayoutDone.current = true;
      } else {
        setNodes(existingNodes => {
          const existingPositions = new Map(existingNodes.map(n => [n.id, n.position]));
          return [...defaultNodes, ...dsNodes].map(node => ({
            ...node,
            position: existingPositions.get(node.id) || node.position,
          }));
        });
        setEdges([...defaultEdges, ...dsEdges]);
      }
    } else {
      setNodes([]);
      setEdges([]);
      isInitialLayoutDone.current = false;
    }
  }, [props.deviceServers, primaryTextColor, defaultNodes, defaultEdges, fitView]);

  return (
    <>
      {props.open && (
        <Dialog
          open={props.open}
          onClose={() => props.setOpen(false)}
          withFullScreen
          fullWidth
          title={dialogTitle}
          scroll="paper"
          maxWidth={'xl'}
          onFullScreenToggled={isFullScreen => {
            setFullScreen(isFullScreen);
          }}
        >
          <DialogContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              height: '100%',
            }}
          >
            <div style={{ width: '100%', height: isFullScreen ? '100%' : '70vh' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                edgesFocusable={false}
                nodeTypes={nodeTypes}
                colorMode={themeName}
                minZoom={0.2}
                defaultViewport={{
                  zoom: 0.2,
                  x: -1000,
                  y: 0,
                }}
              >
                <Background
                  bgColor={themeName === 'dark' ? undefined : '#807E7D'}
                  gap={24}
                  size={1}
                />
                <MiniMap bgColor={primaryTextColor} />
                <Controls />
                <Legend />
              </ReactFlow>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => props.setOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}

export function DeviceDependencyMapAction(props: DependencyMapActionProps) {
  const { namespace, buttonStyle } = props;
  const [open, setOpen] = useState(false);

  const queryData = {
    namespace: namespace?.metadata.name || null,
  };

  const deviceServers = useMemo(() => {
    if (props.resourceClass) {
      const [servers] = props.resourceClass.useList(queryData);
      return servers || [];
    }
    return [];
  }, [props.resourceClass, queryData]);

  const filteredDeviceServers = useMemo(() => {
    if (deviceServers && namespace) {
      return deviceServers
        .filter(item => item.metadata.namespace === namespace?.metadata.name)
        .map(item => item.jsonData);
    }
    return [];
  }, [deviceServers, namespace]);

  return (
    <>
      <ActionButton
        description="TANGO Device Dependency Map"
        buttonStyle={buttonStyle || 'action'}
        onClick={() => setOpen(true)}
        icon="custom-icons:tango"
        iconButtonProps={{
          disabled: !filteredDeviceServers || filteredDeviceServers.length === 0,
        }}
      />
      {open && (
        <ReactFlowProvider>
          <DeviceDependencyMap
            open={open}
            setOpen={setOpen}
            {...props}
            deviceServers={filteredDeviceServers}
          />
        </ReactFlowProvider>
      )}
    </>
  );
}

export function DeviceDependencyMapActionWrapper(props: DependencyMapActionProps) {
  if (!props || !props.namespace) {
    return <></>;
  }

  const { buttonStyle } = props;
  const [resource] = K8s.ResourceClasses?.CustomResourceDefinition?.useGet(
    `deviceservers.tango.tango-controls.org`
  );
  const resourceClass = useMemo(() => {
    return resource?.makeCRClass();
  }, [resource]);

  if (!resourceClass) {
    return (
      <ActionButton
        description="TANGO Device Dependency Map"
        buttonStyle={buttonStyle || 'action'}
        onClick={() => {}}
        icon="custom-icons:tango"
        iconButtonProps={{
          disabled: true,
        }}
      />
    );
  }

  return <DeviceDependencyMapAction resourceClass={resourceClass} {...props} />;
}
