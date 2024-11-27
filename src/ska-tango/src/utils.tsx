import humanizeDuration from 'humanize-duration';

type ThemeUnion = 'light' | 'dark';
const humanize = humanizeDuration.humanizer();
humanize.languages['en-mini'] = {
  y: () => 'y',
  mo: () => 'mo',
  w: () => 'w',
  d: () => 'd',
  h: () => 'h',
  m: () => 'm',
  s: () => 's',
  ms: () => 'ms',
};

export type DateParam = string | number | Date;
export type DateFormatOptions = 'brief' | 'mini';

export interface TimeAgoOptions {
  format?: DateFormatOptions;
}

export function stringCompare(a: string, b: string) {
  return a?.toLowerCase() > b?.toLowerCase() ? 1 : -1;
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export function getHarborUrl(image: string) {
  return `https://harbor.skao.int/harbor/projects/2/repositories/${image}/artifacts-tab`;
}

export function getThemeName(): ThemeUnion {
  const themePreference: ThemeUnion = localStorage.headlampThemePreference;

  if (typeof window.matchMedia !== 'function') {
    return 'light';
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  let themeName: ThemeUnion = 'light';
  if (themePreference) {
    // A selected theme preference takes precedence.
    themeName = themePreference;
  } else {
    if (prefersLight) {
      themeName = 'light';
    } else if (prefersDark) {
      themeName = 'dark';
    }
  }
  if (!['light', 'dark'].includes(themeName)) {
    themeName = 'light';
  }

  return themeName;
}

export function timeAgo(date: DateParam, options: TimeAgoOptions = {}) {
  const fromDate = new Date(date);
  const now = new Date();
  return formatDuration(now.getTime() - fromDate.getTime(), options);
}

export function formatDuration(duration: number, options: TimeAgoOptions = {}) {
  const { format = 'brief' } = options;

  if (format === 'brief') {
    return humanize(duration, {
      fallbacks: ['en'],
      round: true,
      largest: 1,
    });
  }

  return humanize(duration, {
    language: 'en-mini',
    spacer: '',
    fallbacks: ['en'],
    round: true,
    largest: 1,
  });
}

export function tangoDeviceStatusColorFromState(device: { state: string }) {
  if (!device?.state) {
    return 'error';
  }

  const state = device?.state || 'UNKNOWN';
  const redStates = ['FAULT', 'ALARM', 'UNKNOWN'];
  const orangeStates = ['OFF', 'CLOSE', 'STANDBY', 'INIT', 'DISABLE'];

  if (redStates.includes(state.toUpperCase())) {
    return 'error';
  }

  if (orangeStates.includes(state.toUpperCase())) {
    return 'warning';
  }

  return 'success';
}

export function getDeviceServerStatus(deviceServerStatus: { state: string }) {
  const detailedState = deviceServerStatus?.state.toLowerCase();
  const state = detailedState?.match(/^([a-zA-Z]+)/)?.[1];
  const details = detailedState?.match(/\((.*?)\)/)?.[1];
  const status =
    {
      waiting: 'warning',
      building: 'warning',
      error: 'error',
      running: 'success',
    }[state] || 'error';

  return { status, state, details };
}
