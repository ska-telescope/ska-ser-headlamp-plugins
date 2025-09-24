import { ActionButton } from '@kinvolk/headlamp-plugin/lib/components/common';
import { KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/lib/k8s/KubeObject';
import { useEffect, useState } from 'react';
import { getKindFilter, ResourceLinksConfig, ResourceLinkType } from './config';
import getConfig from './config';

export interface ConfigBasedActionProps {
  description: string;
  icon: string;
  type: ResourceLinkType;
  resource: KubeObjectInterface;
}

const openInNewTab = url => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
};

function templateConfig(url: string, values: Record<string, string>) {
  return url.replace(/\$\{(\w+)\}/g, (_, key) => {
    return values[key] ?? '';
  });
}

export function ConfigBasedAction(props: ConfigBasedActionProps) {
  const { description, icon, type, resource } = props;
  const [resourceLinksConfig, setResourceLinksConfig] = useState<ResourceLinksConfig>(null);
  const namespace =
    resource?.kind === 'Namespace' ? resource?.metadata.name : resource?.metadata.namespace;

  useEffect(() => {
    (async () => {
      try {
        setResourceLinksConfig(await getConfig());
      } catch (e) {
        setResourceLinksConfig(null);
      }
    })();

    setResourceLinksConfig(null);
  }, []);

  return (
    <ActionButton
      description={description}
      buttonStyle={'action'}
      onClick={() => {
        // TODO: Implement dynamic timeframes accordingly to resources's age
        var kind = resource?.kind;
        const timeframe = resourceLinksConfig[type].defaultTimeframe;
        const url =
          resourceLinksConfig[type]?.kindUrls[kind] ||
          resourceLinksConfig[type]?.kindUrls['default'];
        var name = resource?.metadata?.name;
        // Logs come tagged with the replicaset name, not the deployment name
        if (kind === 'Deployment' && type === 'logging') {
          name = `'${name}-*'`;
        }

        // Monitoring dashboards only cover deployments
        if (kind === 'ReplicaSet' && type === 'monitoring') {
          kind = 'deployment';
          name = resource?.metadata?.ownerReferences?.at(0)?.name;
        }

        openInNewTab(
          templateConfig(url, {
            kind: kind.toLowerCase(),
            namespace: namespace,
            name: name,
            kindFilter: getKindFilter(type, kind),
            timeframe: timeframe,
          })
        );
      }}
      icon={icon}
      iconButtonProps={{
        disabled: !resourceLinksConfig,
      }}
    />
  );
}
