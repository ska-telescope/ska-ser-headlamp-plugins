export function stringCompare(a: string, b: string) {
  return a?.toLowerCase() > b?.toLowerCase() ? 1 : -1;
}
