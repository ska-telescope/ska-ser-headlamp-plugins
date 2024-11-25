import { KubeCRD } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';
import React from 'react';

export function stringCompare(a: string, b: string) {
  return a?.toLowerCase() > b?.toLowerCase() ? 1 : -1;
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function GetCustomResource(props: {
  name: string;
  namespace: string;
  resource: KubeCRD | null;
  setSource: (...args) => void;
}) {
  const { name, namespace, resource, setSource } = props;
  //const [openDialog, setOpenDialog] = React.useState(false);
  const resourceClass = React.useMemo(() => {
    return resource.makeCRClass();
  }, [resource]);

  resourceClass.useApiGet(setSource, name, namespace);

  return null;
}

export function getHarborUrl(image: string) {
  return `https://harbor.skao.int/harbor/projects/2/repositories/${image}/artifacts-tab`;
}
