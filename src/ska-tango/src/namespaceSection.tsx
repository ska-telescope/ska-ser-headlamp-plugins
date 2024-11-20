import { K8s } from "@kinvolk/headlamp-plugin/lib";

import React from "react";
import { DeviceServersList } from "./deviceServersList";
import { DatabaseDsList } from "./databaseDsList";

export interface TangoResourcesProps {
  namespace: K8s.ResourceClasses.Namespace;
}

export default function NamespacedTangoResources(props: TangoResourcesProps) {
  const [deviceServersCRD] =
    K8s.ResourceClasses.CustomResourceDefinition.useGet(
      "deviceservers.tango.tango-controls.org"
    );

  const deviceServersResourceClass = React.useMemo(() => {
    return deviceServersCRD?.makeCRClass();
  }, [deviceServersCRD]);

  const [databaseDsCRD] = K8s.ResourceClasses.CustomResourceDefinition.useGet(
    "databaseds.tango.tango-controls.org"
  );

  const databaseDsResourceClass = React.useMemo(() => {
    return databaseDsCRD?.makeCRClass();
  }, [databaseDsCRD]);

  return (
    <>
      {deviceServersCRD && (
        <DeviceServersList
          namespace={props.namespace}
          resourceClass={deviceServersResourceClass}
          hideWithoutItems={true}
        />
      )}
      {databaseDsResourceClass && (
        <DatabaseDsList
          namespace={props.namespace}
          resourceClass={databaseDsResourceClass}
          hideWithoutItems={true}
        />
      )}
    </>
  );
}
