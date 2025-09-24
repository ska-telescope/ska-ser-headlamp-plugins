import { DetailsViewSectionProps } from '@kinvolk/headlamp-plugin/lib';
import { SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { useTranslation } from 'react-i18next';
import { OwnershipDetails } from './details';

export default function OwnerDetailsSection(resource: DetailsViewSectionProps) {
  const resourceLabels = resource.jsonData.metadata.labels || {};
  const resourceAnnotations = resource.jsonData.metadata.annotations || {};
  const hasCicdLabels = Object.keys(resourceLabels).some(key => key.startsWith('cicd.skao.int'));
  const hasCicdAnnotations = Object.keys(resourceAnnotations).some(key =>
    key.startsWith('cicd.skao.int')
  );
  const { t } = useTranslation();

  return (
    <>
      {(hasCicdLabels || hasCicdAnnotations) && (
        <SectionBox title={t('CICD Metadata')}>
          <OwnershipDetails resource={resource} />
        </SectionBox>
      )}
    </>
  );
}
