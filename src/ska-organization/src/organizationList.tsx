import { K8s } from '@kinvolk/headlamp-plugin/lib';
import { Loader, SimpleTable } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Link as MUILink } from '@mui/material';
import { getRouteUrl, stringCompare } from './utils';

export interface OrganizationListProps {
  filter: string;
  path: string;
  extraColumns?: any[];
}

export interface OrganizationListColumnProps {
  label: string;
  render: (namespaces: any[], element: any) => void;
}

export default function OrganizationList(props: OrganizationListProps) {
  const [namespaces, error] = K8s.ResourceClasses.Namespace.useList();
  if (error) {
    console.error('Failed to fetch namespaces:', error);
  }

  const elementFilter = props.filter;
  const elementUrl = props.path;
  const elements =
    Array.from(
      new Set(
        namespaces
          ?.map(item => item.jsonData.metadata?.labels?.[elementFilter])
          .filter(value => value !== undefined && value && value !== '')
      )
    ).sort(stringCompare) || [];

  const defaultColumns = [
    {
      label: 'Name',
      getter: element => {
        return (
          <MUILink href={getRouteUrl(`${elementUrl}/:name`, { name: element })}>{element}</MUILink>
        );
      },
      sort: stringCompare,
    },
    {
      label: 'Persistent Namespaces',
      getter: element => {
        return Array.from(
          new Set(
            namespaces
              ?.filter(
                item => (item.jsonData.metadata?.labels?.[elementFilter] || null) === element
              )
              .filter(item => !(item.jsonData.metadata?.name || '').startsWith('ci-'))
              .map(item => item.jsonData.metadata?.name)
          )
        ).length;
      },
      sort: true,
    },
    {
      label: 'CI Namespaces',
      getter: element => {
        return Array.from(
          new Set(
            namespaces
              ?.filter(
                item => (item.jsonData.metadata?.labels?.[elementFilter] || null) === element
              )
              .filter(item => (item.jsonData.metadata?.name || '').startsWith('ci-'))
              .map(item => item.jsonData.metadata?.name)
          )
        ).length;
      },
      sort: true,
    },
    {
      label: 'Pipelines',
      getter: element => {
        return Array.from(
          new Set(
            namespaces
              ?.filter(
                item => (item.jsonData.metadata?.labels?.[elementFilter] || null) === element
              )
              .map(item => item.jsonData.metadata?.labels?.['cicd.skao.int/pipelineId'])
              .filter(item => item !== undefined && item && item !== null)
          )
        ).length;
      },
    },
  ];

  const extraColumns = [];
  if (props.extraColumns && props.extraColumns.length > 0) {
    props.extraColumns.forEach(column => {
      extraColumns.push({
        label: column.label,
        getter: (element: any) => {
          return column.render(namespaces, element);
        },
      });
    });
  }

  return (
    <>
      {namespaces ? (
        <SimpleTable columns={defaultColumns.concat(extraColumns)} data={elements || []} />
      ) : (
        <Loader />
      )}
    </>
  );
}
