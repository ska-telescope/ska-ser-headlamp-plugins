import semver from 'semver';

export function stringCompare(a: string, b: string) {
  return a?.toLowerCase() > b?.toLowerCase() ? 1 : -1;
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function compareVersions(versionA: string, versionB: string): string | null {
  if (!versionB || semver.gte(versionA, versionB)) {
    return versionA;
  }

  return versionB;
}
