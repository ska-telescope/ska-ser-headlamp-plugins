import { useParams } from "react-router-dom";
import { ObjectEvents } from "./common/Events";
import { SectionBox } from "@kinvolk/headlamp-plugin/lib/components/common";
import CustomResourceDetails from "./common/CustomResourceDetails";
import BackLink from "./common/BackLink";

export default function DatabaseDsDetailedView() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  let events = null;
  const resource = null;

  return (
    <>
      <BackLink />
      <SectionBox title={"Database DS"}>
        {resource && (
          <CustomResourceDetails
            resource={resource}
            name={name}
            namespace={namespace}
          />
        )}
        {events && <ObjectEvents events={[]} />}
      </SectionBox>
    </>
  );
}
