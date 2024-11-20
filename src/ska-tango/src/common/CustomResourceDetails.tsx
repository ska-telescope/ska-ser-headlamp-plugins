export default function CustomResourceDetails(props) {
  const { name, namespace, resource } = props;
  return (
    <>
      <p>{name}</p>
      <p>{namespace}</p>
      <p>{resource}</p>
    </>
  );
}
