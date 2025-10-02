import {
  DateLabel,
  Link,
  Table as HTable,
  TableColumn,
  TableProps as HTableProps,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { StatusLabel as HLStatusLabel } from '@kinvolk/headlamp-plugin/lib/components/common';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/lib/k8s/cluster';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';
import { DeviceServerConfigAction } from './Olhinho';
import StatefulSetFinder from './StatefulSetFinder';
import StatusLabel from './StatusLabel';

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
                const devicesTotal = item?.jsonData.status?.devicecount || 1;
                const devicesReady = item?.jsonData.status?.devicereadycount || 0;
                return (
                  <Tooltip
                    slotProps={{ tooltip: { sx: { fontSize: '0.9em' } } }}
                    title={`${devicesReady} of ${devicesTotal} devices ready`}
                    arrow
                    disableInteractive={false}
                  >
                    <span style={{ display: 'inline-block' }}>
                      <HLStatusLabel
                        status={
                          devicesReady === devicesTotal
                            ? 'success'
                            : devicesReady === 0
                            ? 'error'
                            : 'warning'
                        }
                      >{`${devicesReady}/${devicesTotal}`}</HLStatusLabel>
                    </span>
                  </Tooltip>
                );
              },
            };
          case 'components':
            return {
              header: 'Components',
              Cell: ({ row: { original: item } }) => {
                const componentsTotal = item?.jsonData.status?.replicas || 0;
                const componentsReady = item?.jsonData.status?.succeeded || 0;
                return (
                  <Tooltip
                    slotProps={{ tooltip: { sx: { fontSize: '0.9em' } } }}
                    title={`${componentsReady} of ${componentsTotal} components ready`}
                    arrow
                    disableInteractive={false}
                  >
                    <span style={{ display: 'inline-block' }}>
                      <HLStatusLabel
                        status={
                          componentsReady === componentsTotal
                            ? 'success'
                            : componentsReady === 0
                            ? 'error'
                            : 'warning'
                        }
                      >{`${componentsReady}/${componentsTotal}`}</HLStatusLabel>
                    </span>
                  </Tooltip>
                );
              },
            };
          case 'statefulset':
            return {
              header: 'DS Stateful Set',
              Cell: ({ row: { original: item } }) => {
                return (
                  <StatefulSetFinder
                    name={item.metadata.name}
                    namespace={item.metadata.namespace}
                    allowedNames={['databaseds-ds', 'deviceserver']}
                  />
                );
              },
            };
          case 'dbstatefulset':
            return {
              header: 'DB Stateful Set',
              Cell: ({ row: { original: item } }) => {
                return (
                  <StatefulSetFinder
                    name={item.metadata.name}
                    namespace={item.metadata.namespace}
                    allowedNames={['databaseds-tangodb']}
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
