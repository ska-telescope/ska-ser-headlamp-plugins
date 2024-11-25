import {
  DateLabel,
  Link,
  Table as HTable,
  TableColumn,
  TableProps as HTableProps,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import ViewButton from './Olhinho';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/lib/k8s/cluster';
import StatusLabel from './StatusLabel';
import StatefulSetFind from './StatefulSet';

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
              Cell: ({ row: { original: item } }) => {
                return(
                  <StatusLabel item={item} />
                );
              }
            };
          case 'devices':
            return "<devicesReady>/<devicesTotal>";
          case 'statefulset':
            return {
              header: 'StatefulSet',
              Cell: ({ row: { original: item } }) => {
                const labelSelector = 'app.kubernetes.io/instance=' + item.metadata.name;
                return(
                  <StatefulSetFind name={item.metadata.name} namespace={item.metadata.namespace} labelSelector={labelSelector} />
                );
              },
            };
          case 'config':
            return {
              gridTemplate: 'min-content',
              header: 'Config',
              Cell: ({ row: { original: item } }) => {
                const config = JSON.parse(item.jsonData.spec?.config);
                const dependsOn = item.jsonData.spec?.dependsOn;
                const combinedJson = {
                  config,
                  dependsOn
                };
                return(
                <ViewButton jsonData={ combinedJson || {}} buttonStyle="menu" />)
              }
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
