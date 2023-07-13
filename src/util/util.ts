export function escapeURL(str: string): string {
  return str.replace(/#/g, "%23");
}
