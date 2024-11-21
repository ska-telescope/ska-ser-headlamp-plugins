export function stringCompare(a: string, b: string) {
  return a?.toLowerCase() > b?.toLowerCase() ? 1 : -1;
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function mostFrequentString(arr: string[]): string | null {
  if (arr.length === 0) {
    return null;
  }

  const frequencyMap: Map<string, number> = new Map();
  for (const str of arr) {
    const count = frequencyMap.get(str) || 0;
    frequencyMap.set(str, count + 1);
  }

  let maxCount = 0;
  let mostFrequent: string | null = null;

  for (const [str, count] of frequencyMap.entries()) {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = str;
    }
  }

  return mostFrequent;
}
