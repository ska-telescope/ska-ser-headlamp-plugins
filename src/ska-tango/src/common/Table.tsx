import {
  DateLabel,
  Link,
  Table as HTable,
  TableColumn,
  TableProps as HTableProps,
} from "@kinvolk/headlamp-plugin/lib/components/common";
import { KubeObject } from "@kinvolk/headlamp-plugin/lib/lib/k8s/cluster";
import { KubeCRD } from "@kinvolk/headlamp-plugin/lib/lib/k8s/crd";
import React from "react";
import StatusLabel from "./StatusLabel";

type CommonColumnType = "namespace" | "name" | "age" | "status";

interface TableCol {
  header: string;
  accessorKey?: string;
  accessorFn?: (item: any) => React.ReactNode;
  Cell?: (props: { row: { original: any } }) => React.ReactNode;
}

interface NameColumn extends Partial<TableCol> {
  extends: "name";
  routeName?: string;
}

export interface TableProps extends Omit<HTableProps, "columns"> {
  columns: (TableCol | CommonColumnType | NameColumn | TableColumn)[];
}

function prepareNameColumn(colProps: Partial<NameColumn> = {}): TableCol {
  const { routeName, ...genericProps } = colProps;

  // Remove the extends property from the genericProps
  delete genericProps.extends;

  return {
    header: "Name",
    accessorKey: "metadata.name",
    Cell: ({ row: { original: item } }) => (
      <Link
        routeName={
          routeName ?? `/tango/${item.kind.toLowerCase()}s/:namespace/:name`
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
    return columns.map((column) => {
      if (typeof column === "string") {
        switch (column) {
          case "name":
            return prepareNameColumn();
          case "namespace":
            return {
              header: "Namespace",
              accessorKey: "metadata.namespace",
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
          case "age":
            return {
              id: "age",
              header: "Age",
              gridTemplate: "min-content",
              accessorFn: (item: KubeObject) =>
                -new Date(item.metadata.creationTimestamp).getTime(),
              enableColumnFilter: false,
              muiTableBodyCellProps: {
                align: "right",
              },
              Cell: ({ row }) =>
                row.original && (
                  <DateLabel
                    date={row.original.metadata.creationTimestamp}
                    format="mini"
                  />
                ),
            };
          case "status":
            return {
              header: "Status",
              accessorFn: (item) => {
                return <StatusLabel item={item} />;
              },
            };
          default:
            return column;
        }
      }

      if ((column as NameColumn).extends === "name") {
        return prepareNameColumn(column as NameColumn);
      }

      return column;
    });
  }, [columns]);

  return (
    <HTable
      data={data}
      loading={data === null}
      {...otherProps}
      columns={processedColumns}
    />
  );
}

export default Table;
