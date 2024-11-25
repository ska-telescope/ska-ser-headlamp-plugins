export default function CustomResourceDetails(props) {
  const { name, namespace, resource, statefulset, config } = props;
  return (
    <>
      <p>{name}</p>
      <p>{namespace}</p>
      <p>{resource}</p>
      <p>{statefulset}</p>
      <p>{config}</p>
    </>
  );
}
