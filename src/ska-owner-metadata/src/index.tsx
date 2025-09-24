import {
  DefaultDetailsViewSection,
  registerDetailsViewSectionsProcessor,
} from '@kinvolk/headlamp-plugin/lib';
import OwnerDetails from './section';

registerDetailsViewSectionsProcessor(function addSubheaderSection(resource, sections) {
  // Ignore if there is no resource.
  if (!resource) {
    return sections;
  }

  const ownerMetadataSection = 'owner_metadata';
  if (sections.findIndex(section => section.id === ownerMetadataSection) !== -1) {
    return sections;
  }

  const metadataIdx = sections.findIndex(
    section => section.id === DefaultDetailsViewSection.METADATA
  );
  // There is no header, so we do nothing.
  if (metadataIdx === -1) {
    return sections;
  }

  // We place our custom section after the header.
  sections.splice(metadataIdx + 1, 0, {
    id: ownerMetadataSection,
    section: OwnerDetails(resource),
  });

  return sections;
});
