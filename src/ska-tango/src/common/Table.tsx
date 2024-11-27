import {
  DateLabel,
  Link,
  Table as HTable,
  TableColumn,
  TableProps as HTableProps,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/lib/k8s/cluster';
import React from 'react';
import { DeviceServerConfigAction } from './Olhinho';
import StatefulSetFind from './StatefulSet';
import StatusLabel from './StatusLabel';
import Tooltip from '@mui/material/Tooltip';
import { StatusLabel as HLStatusLabel } from '@kinvolk/headlamp-plugin/lib/components/common';




type CommonColumnType = 'namespace' | 'name' | 'age' | 'status';

interface TableCol {
  header: string;
  accessorKey?: string;
  accessorFn?: (item: any) => React.ReactNode;
  Cell?: (props: { row: { original: any } }) => React.ReactNode;
}

interface NameColumn extends Partial<TableCol> {
  extends: 'name';
  routeName?: string;
}

export interface TableProps extends Omit<HTableProps, 'columns'> {
  columns: (TableCol | CommonColumnType | NameColumn | TableColumn)[];
}

function prepareNameColumn(colProps: Partial<NameColumn> = {}): TableCol {
  const { routeName, ...genericProps } = colProps;

  // Remove the extends property from the genericProps
  delete genericProps.extends;

  return {
    header: 'Name',
    accessorKey: 'metadata.name',
    Cell: ({ row: { original: item } }) => (
      <Link
        routeName={
          routeName ??
          `/tango/${item.kind.toLowerCase()}${
            item.kind.toLowerCase() === 'databaseds' ? '' : 's'
          }/:namespace/:name`
        }
        params={{
          name: item.metadata.name,
          namespace: item.metadata.namespace,
        }}
      >
        {item.metadata.name}
      </Link>
    ),
    ...genericProps,
  };
}

export function Table(props: TableProps) {
  const { columns, data, ...otherProps } = props;

  const processedColumns = React.useMemo(() => {
    return columns.map(column => {
      if (typeof column === 'string') {
        switch (column) {
          case 'name':
            return prepareNameColumn();
          case 'namespace':
            return {
              header: 'Namespace',
              accessorKey: 'metadata.namespace',
              Cell: ({ row: { original: item } }) => (
                <Link
                  routeName="namespace"
                  params={{
                    name: item.metadata.namespace,
                  }}
                >
                  {item.metadata.namespace}
                </Link>
              ),
            };
          case 'age':
            return {
              id: 'age',
              header: 'Age',
              gridTemplate: 'min-content',
              accessorFn: (item: KubeObject) =>
                -new Date(item.metadata.creationTimestamp).getTime(),
              enableColumnFilter: false,
              muiTableBodyCellProps: {
                align: 'right',
              },
              Cell: ({ row }) =>
                row.original && (
                  <DateLabel date={row.original.metadata.creationTimestamp} format="mini" />
                ),
            };
          case 'status':
            return {
              gridTemplate: 'min-content',
              header: 'Status',
              accessorFn: (item: KubeObject) => item?.jsonData?.status?.state,
              Cell: ({ row: { original: item } }) => {
                return <StatusLabel item={item} />;
              },
            };
          case 'devices':
            return {
              header: 'Devices',
              Cell: ({ row: { original: item } }) => {
                const devicesReady = item?.jsonData.status?.devicereadycount || 0;
                const devicesTotal = item?.jsonData.status?.devicecount || 1;
                const percentage = ((devicesReady / devicesTotal) * 100).toFixed(1);
                // Determine progress bar color
                const progressColor =
                percentage === "100.0"
                  ? 'success' // Green for 100%
                  : percentage === "0.0"
                  ? 'error' // Red for 0%
                  : 'warning'; // Orange for values in between
                return (
                  <Tooltip title={`${devicesReady} of ${devicesTotal} devices ready`} arrow disableInteractive={false}>
                    <span style={{ display: 'inline-block' }}>
                      <HLStatusLabel status={progressColor}>{`${devicesReady}/${devicesTotal}`}</HLStatusLabel>
                    </span>
                  </Tooltip>
                );
              },
            };
          case 'statefulset':
            return {
              header: 'StatefulSet',
              Cell: ({ row: { original: item } }) => {
                const labelSelector = 'app.kubernetes.io/instance=' + item.metadata.name;
                return (
                  <StatefulSetFind
                    name={item.metadata.name}
                    namespace={item.metadata.namespace}
                    labelSelector={labelSelector}
                  />
                );
              },
            };
          case 'config':
            return {
              gridTemplate: 'min-content',
              header: 'Config',
              Cell: ({ row: { original: item } }) => {
                return <DeviceServerConfigAction resource={item} maxWidth={'lg'} />;
              },
            };
          default:
            return column;
        }
      }

      if ((column as NameColumn).extends === 'name') {
        return prepareNameColumn(column as NameColumn);
      }

      return column;
    });
  }, [columns]);

  return <HTable data={data} loading={data === null} {...otherProps} columns={processedColumns} />;
}

export default Table;
