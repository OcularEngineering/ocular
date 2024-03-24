export function parseBoolean(value: string | boolean | undefined): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === undefined) {
    return false;
  }
  return value === 'true';
}

export function removeNewlines(s: string = ''): string {
  return s.replaceAll(/[\n\r]+/g, ' ');
}