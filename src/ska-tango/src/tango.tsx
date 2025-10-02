import { ApiProxy } from '@kinvolk/headlamp-plugin/lib';
import { SectionBox } from '@kinvolk/headlamp-plugin/lib/components/common';
import MuiLink from '@mui/material/Link';
import { useEffect, useState } from 'react';

const request = ApiProxy.request;

async function hasTangoCRDs() {
  const response = await request(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions/deviceservers.tango.tango-controls.org`,
    {
      method: 'GET',
    }
  );

  return response !== null;
}

function TangoNotInstalled() {
  return (
    <SectionBox>
      <h1>SKA TANGO CRDs are not installed</h1>
      <p>
        Follow the{' '}
        <MuiLink target="_blank" href="https://gitlab.com/ska-telescope/ska-tango-operator">
          installation guide
        </MuiLink>{' '}
        to install the SKA TANGO Operator and its CRDs
      </p>
    </SectionBox>
  );
}

export default function TangoDetectionWrapper({ children, omit }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [hasCRDs, setHasCRDs] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        setHasCRDs(await hasTangoCRDs());
        setLoading(false);
      } catch (e) {
        setLoading(false);
        return;
      }
    })();
  }, []);

  if (!loading && !hasCRDs) {
    return omit ? <></> : <TangoNotInstalled />;
  }

  return <>{children}</>;
}
