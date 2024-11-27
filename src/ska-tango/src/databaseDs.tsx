import TangoResourceDetailedView from './common/TangoResource';

export default function DatabaseDsDetailedView() {
  const extraInfo = item => {
    const loadBalancerIP = item?.jsonData?.status?.resources?.databaseds?.lbs?.[0]?.ip;
    return [
      loadBalancerIP
        ? {
            name: 'Loadbalancer IP',
            value: loadBalancerIP,
          }
        : null,
    ].filter(info => info !== null);
  };

  return (
    <TangoResourceDetailedView
      resourceType="databaseds"
      extraInfo={extraInfo}
    ></TangoResourceDetailedView>
  );
}
