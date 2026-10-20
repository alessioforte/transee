export type Theme = 'dark' | 'light';

export function normalizeTheme(value: unknown): Theme {
  return value === 'light' ? 'light' : 'dark';
}
