import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getColorLuminance } from '@/shared/color';

const tokens = readFileSync(
  join(__dirname, '../shared/styles/tokens.css'),
  'utf8'
);

const read = (name: string): string => {
  const match = tokens.match(new RegExp(`${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`token ${name} not found in tokens.css`);
  return match[1].trim();
};

describe('tokens.css mirrors the old theme object', () => {
  it.each([
    ['--color-background', '#2a2a2a'],
    ['--color-frame', '#1a1a1a'],
    ['--color-foreground', '#555555'],
    ['--color-flatground', '#373737'],
    ['--color-idle', '#999999'],
    ['--color-primary', '#0077b5'],
    ['--color-text-main', '#ffffff'],
    ['--color-text-soft', '#aaaaaa'],
    ['--color-text-idle', '#444444'],
    ['--color-text-info', '#0077b5'],
  ])('%s = %s', (name, expected) => {
    expect(read(name)).toBe(expected);
  });
});

describe('derived tints are still what getColorLuminance produces', () => {
  // These were computed at module-eval time by styled-components template
  // literals. They are baked into tokens.css now, so this is the guard that
  // they were baked correctly — and stay correct if the palette changes.
  it.each([
    ['--color-text-low-hover', '#999999', 0.5],
    ['--color-primary-hover', '#0077B5', 0.1],
    ['--color-primary-active', '#0077B5', 0.3],
    ['--color-text-info-hover', '#0077B5', 0.5],
    ['--color-text-info-active', '#0077B5', 0.9],
  ])('%s = getColorLuminance(%s, %d)', (name, hex, luminance) => {
    expect(read(name as string)).toBe(
      getColorLuminance(hex as string, luminance as number)
    );
  });
});

describe('light palette readability', () => {
  const light = tokens.split(":root[data-theme='light']")[1];
  const readLight = (name: string) =>
    light.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim() ?? read(name);

  function luminance(hex: string) {
    const channels = hex.match(/[a-f\d]{2}/gi)!.map((channel) => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }

  it.each([
    ['text-main', 'background'],
    ['text-soft', 'background'],
    ['text-low', 'frame'],
    ['text-primary', 'background'],
    ['text-info', 'background'],
    ['text-error', 'background'],
    ['text-on-accent', 'primary'],
    ['text-on-accent', 'info'],
  ])('keeps %s readable on %s', (text, surface) => {
    const a = luminance(readLight(`--color-${text}`));
    const b = luminance(readLight(`--color-${surface}`));
    expect(
      (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
    ).toBeGreaterThanOrEqual(4.5);
  });
});
