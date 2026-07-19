export function signed(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

export function titleCase(value: string): string {
  return value.replace(
    /(^|-)([a-z])/g,
    (_, prefix: string, letter: string) => (prefix ? ' ' : '') + letter.toUpperCase(),
  );
}
