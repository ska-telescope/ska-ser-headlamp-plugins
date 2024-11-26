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

type ThemeUnion = 'light' | 'dark';
export function getThemeName(): ThemeUnion {
  const themePreference: ThemeUnion = localStorage.headlampThemePreference;

  if (typeof window.matchMedia !== 'function') {
    return 'light';
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  let themeName: ThemeUnion = 'light';
  if (themePreference) {
    // A selected theme preference takes precedence.
    themeName = themePreference;
  } else {
    if (prefersLight) {
      themeName = 'light';
    } else if (prefersDark) {
      themeName = 'dark';
    }
  }
  if (!['light', 'dark'].includes(themeName)) {
    themeName = 'light';
  }

  return themeName;
}
