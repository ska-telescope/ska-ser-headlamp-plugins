import { SectionBox } from '@kinvolk/headlamp-plugin/lib/components/common';
import { useParams } from 'react-router-dom';
import BackLink from './common/BackLink';
import CustomResourceDetails from './common/CustomResourceDetails';
import { ObjectEvents } from './common/Events';

export default function DeviceServerDetailedView() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const events = null;
  const resource = null;
  const statefulset = null;
  const config = null;

  return (
    <>
      <BackLink />
      <SectionBox title={'Device Server'}>
        {resource && (
          <CustomResourceDetails
            resource={resource}
            name={name}
            namespace={namespace}
            statefulset={statefulset}
            config={config}
          />
        )}
        {events && <ObjectEvents events={[]} />}
      </SectionBox>
    </>
  );
}
