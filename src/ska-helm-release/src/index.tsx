import {
  DefaultDetailsViewSection,
  registerDetailsViewSectionsProcessor,
} from '@kinvolk/headlamp-plugin/lib';
import HelmRelease from './section';

registerDetailsViewSectionsProcessor(function addSubheaderSection(resource, sections) {
  if (!resource || resource.kind !== 'Namespace') {
    return sections;
  }

  const helmSection = 'helm_section';
  if (sections.findIndex(section => section.id === helmSection) !== -1) {
    return sections;
  }

  let targetIdx = sections.findIndex(section => section.id === 'owner_metadata');

  if (targetIdx === -1) {
    targetIdx = sections.findIndex(section => section.id === DefaultDetailsViewSection.METADATA);
  }

  if (targetIdx === -1) {
    return sections;
  }

  // We place our custom section after the header.
  sections.splice(targetIdx + 1, 0, {
    id: helmSection,
    section: <HelmRelease namespace={resource}></HelmRelease>,
  });

  return sections;
});
