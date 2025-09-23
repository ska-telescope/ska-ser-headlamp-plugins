import { K8s } from '@kinvolk/headlamp-plugin/lib';
import { ApiProxy } from '@kinvolk/headlamp-plugin/lib';
import { ActionButton } from '@kinvolk/headlamp-plugin/lib/components/common';
import { useEffect, useState } from 'react';
import appConfig from './config';

const request = ApiProxy.request;

export interface ConfigBasedActionProps {
  description: string;
  icon: string;
  config: string;
  namespace: K8s.ResourceClasses.Namespace;
}

const openInNewTab = url => {
  console.log(url)
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
};

function templateConfig(url: string, namespace: string) {
  return url.replace(/\$\{namespace\}/g, namespace);
}

async function getConfig(config: string) {
  const queryParams = new URLSearchParams();
  const labelSelector = appConfig.getConfig().clusterConfigMapLabel || 'headlamp/config';
  queryParams.append('labelSelector', labelSelector);
  const response = await request(`/api/v1/configmaps?${queryParams.toString()}`, {
    method: 'GET',
  });

  if (response.items && response.items.length > 0) {
    return response.items.at(0)?.data?.[config] || null;
  }

  return null;
}

export function ConfigBasedAction(props: ConfigBasedActionProps) {
  const { description, icon, config, namespace } = props;
  const [configUrl, setConfigUrl] = useState<string>(null);

  useEffect(() => {
    (async () => {
      try {
        setConfigUrl(await getConfig(config));
      } catch (e) {
        setConfigUrl(null);
      }
    })();
    setConfigUrl(null);
  }, []);

  return (
    <ActionButton
      description={description}
      buttonStyle={'action'}
      onClick={() => openInNewTab(templateConfig(configUrl, namespace.metadata.name))}
      icon={icon}
      iconButtonProps={{
        disabled: !configUrl,
      }}
    />
  );
}
