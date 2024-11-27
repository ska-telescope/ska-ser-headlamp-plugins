import { addIcon } from '@iconify/react';
import { registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import {
  DefaultDetailsViewSection,
  registerDetailsViewSectionsProcessor,
} from '@kinvolk/headlamp-plugin/lib';
import { SectionBox } from '@kinvolk/headlamp-plugin/lib/components/common';
import DatabaseDsDetailedView from './databaseDs';
import DatabaseDs from './databaseDsList';
import DeviceServerDetailedView from './deviceServer';
import DeviceServers from './deviceServersList';
import NamespacedTangoResources from './namespaceSection';
import TangoDetectionWrapper from './tango';
import { TangoOverviewWrapper } from './tangoOverview';

addIcon('simple-icons:tango', {
  body: '<path d="M88.5 3.938c4.235 1.8 5.925 4.77 7.75 8.874 1.254 5.329 1.46 9.445-.625 14.563C94 30 94 30 92 32c-2.313.5-2.313.5-5 0-4.439-3.922-5.929-7.66-6.848-13.469-.303-5.04.701-8.91 3.66-13.093C86 4 86 4 88.5 3.938ZM100.688 38.438c4.13 4.577 6.14 10.066 6.562 16.187L107 57a56.54 56.54 0 0 1-7-4c-3.009-.152-3.009-.152-6 1-7.68 8.339-7.86 21.95-9.188 32.688l-.537 4.185A2511.8 2511.8 0 0 0 83 101c-4.995-8.738-4.403-20.825-4.75-30.625l-.168-3.445C77.712 57.17 77.824 47.012 84 39c5.888-3.555 10.597-3.82 16.688-.563Z" fill="currentColor"/><path d="M96 57c10.412.568 18.698 4.935 27 11l2.625 1.875c11.015 9.856 20.308 24.551 21.582 39.56.097 2.63.122 5.246.106 7.877l-.015 2.799c-.24 13.91-.24 13.91-3.298 18.889-2.262 1.504-2.262 1.504-5 2-2.79-1.484-2.79-1.484-5.625-3.75l-2.852-2.234L128 133l-3-2c-.23-2.208-.23-2.208-.047-4.953l.14-3.047.157-3.25c.272-10.87-.973-17.805-7.25-26.75l-1.309-2.148C111.133 82.92 99.932 79.47 91 77c-1-1-1-1-1.375-4.438.03-5.37 2.527-11.714 6.375-15.562ZM74 58c1 1 1 1 1.114 2.858l-.016 2.396-.01 2.588-.025 2.72-.014 2.733C75.037 73.53 75.02 75.765 75 78c-.88.447-1.76.895-2.668 1.355l-3.52 1.832-3.48 1.793C61.99 85.006 59.633 87.133 57 90l-2 2.125c-6.637 9.541-9.006 19.382-8 30.875 1.314 5.687 2.746 11.119 6 16v4a64.379 64.379 0 0 1-7.25 4.813l-2.066 1.271c-5.063 2.984-5.063 2.984-7.814 2.684-3.904-1.603-4.917-6.606-6.475-10.248-6.273-15.83-6.384-32.068-.024-47.942C36.753 77.363 49.444 65.568 66 59c2.945-.982 4.935-1.161 8-1ZM102 123c5 1.316 8.898 3.676 13.238 6.375 2.796 1.645 5.634 3.008 8.575 4.375 10.03 4.944 24.069 13.689 28.03 24.566.718 4.075.347 6.96-1.593 10.621-2.548 3.47-4.158 4.773-8.313 5.875-6.762.323-12.685-1.514-17.937-5.812l9-4c.886-5.867-.07-8.674-3.563-13.5A271.27 271.27 0 0 0 125 146l-1.809-2.234C119.2 139.008 114.744 134.99 110 131a1082.9 1082.9 0 0 1-4.5-3.875l-2.031-1.742L102 124v-1Z" fill="currentColor"/><path d="m72 131 1 2a81.776 81.776 0 0 1-3.875 6.5l-1.249 1.914C64.077 147.108 59.707 152.039 55 157a510.886 510.886 0 0 0-2.73 3.14c-5.891 6.776-10.603 11.866-19.833 13.485-4.765-.866-7.563-2.72-10.437-6.625-1.964-5.031-1.155-9.298.688-14.25 1.653-3.698 3.528-6.767 6.312-9.75l.332 2.117.48 2.758.458 2.742c.56 2.727.56 2.727 3.73 4.383 6.3-.171 10.118-1.763 15.188-5.375l1.928-1.328C58.486 143.123 65.628 137.372 72 131ZM117 144c5.234 4.273 9.671 8.816 14 14-3.807 8.53-13.747 13.913-22.098 17.23-16.8 5.767-33.774 5.439-49.922-2.18-2.818-1.495-5.389-3.19-7.98-5.05 4.061-5.594 8.38-10.86 13-16 3.142.566 5.984 1.292 8.938 2.5 10.08 3.863 20.017 3.122 30.062-.5 5.136-2.73 10.017-5.717 14-10ZM168.965 168.758c4.467 2.326 7.27 5.137 10.035 9.242.5 2.688.5 2.688 0 5-1.632 2.132-2.539 2.909-5.2 3.434-6.087.01-10.838-.73-15.8-4.434-2.732-3.142-3.856-5.083-4.5-9.188.5-2.812.5-2.812 1.938-4.75 4.528-1.877 9.02-1.042 13.527.696ZM25 175c1.315 5.74 1.097 9.878-2 15-3.301 3.85-6.755 7.141-11.875 8.063C8 198 8 198 6 196c-1.22-6.071.326-10.884 3.5-16.05 4.179-5.431 9.098-7.891 15.5-4.95Z" fill="currentColor"/>',
  width: 182,
  height: 200,
});

registerSidebarEntry({
  parent: null,
  name: 'tango',
  label: 'TANGO',
  url: '/tango',
  icon: 'simple-icons:tango',
});

registerRoute({
  path: '/tango',
  sidebar: 'tango',
  name: 'tango',
  exact: true,
  component: () => {
    return (
      <TangoDetectionWrapper omit={false}>
        <SectionBox title="TANGO" textAlign="center" paddingTop={2}>
          <TangoOverviewWrapper />
        </SectionBox>
      </TangoDetectionWrapper>
    );
  },
});

registerSidebarEntry({
  parent: 'tango',
  name: 'deviceservers',
  label: 'Device Servers',
  url: '/tango/deviceservers',
  icon: 'mdi:server-network',
});

registerSidebarEntry({
  parent: 'tango',
  name: 'databaseds',
  label: 'Database DS',
  url: '/tango/databaseds',
  icon: 'mdi:database',
});

registerRoute({
  path: '/tango/deviceservers',
  parent: 'tango',
  sidebar: 'deviceservers',
  component: () => <DeviceServers />,
  exact: true,
  name: 'Device Servers',
});

registerRoute({
  path: '/tango/databaseds',
  parent: 'tango',
  sidebar: 'databaseds',
  component: () => <DatabaseDs />,
  exact: true,
  name: 'Database DS',
});

registerRoute({
  path: '/tango/deviceservers/:namespace/:name',
  parent: 'tango',
  sidebar: 'deviceservers',
  component: () => <DeviceServerDetailedView />,
  exact: true,
  name: 'Device Server',
});

registerRoute({
  path: '/tango/databaseds/:namespace/:name',
  parent: 'tango',
  sidebar: 'databaseds',
  component: () => <DatabaseDsDetailedView />,
  exact: true,
  name: 'Database DS',
});

registerDetailsViewSectionsProcessor(function addSubheaderSection(resource, sections) {
  if (!resource || resource.kind !== 'Namespace') {
    return sections;
  }

  const tangoSection = 'tango_section';
  if (sections.findIndex(section => section.id === tangoSection) !== -1) {
    return sections;
  }

  let targetIdx = sections.findIndex(section => section.id === 'helm_section');

  if (targetIdx === -1) {
    targetIdx = sections.findIndex(section => section.id === DefaultDetailsViewSection.METADATA);
  }

  if (targetIdx === -1) {
    return sections;
  }

  // We place our custom section after the header.
  sections.splice(targetIdx + 1, 0, {
    id: tangoSection,
    section: (
      <TangoDetectionWrapper omit>
        <NamespacedTangoResources namespace={resource} />
      </TangoDetectionWrapper>
    ),
  });

  return sections;
});
