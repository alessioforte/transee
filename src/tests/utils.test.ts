import { describe, expect, it } from 'vitest';
import { validateInput } from '@/utils';
import { getColorLuminance } from '@/shared/color';

describe('validateInput (gates suggestion requests)', () => {
  it('accepts plain lowercase text', () => {
    expect(validateInput('hello world')).toBe(true);
  });
  it('rejects empty input', () => {
    expect(validateInput('')).toBe(false);
  });
  it('rejects uppercase letters', () => {
    expect(validateInput('Hello')).toBe(false);
  });
  it('rejects double spaces', () => {
    expect(validateInput('hello  world')).toBe(false);
  });
  it('rejects a leading space', () => {
    expect(validateInput(' hello')).toBe(false);
  });
  it('rejects newlines', () => {
    expect(validateInput('hello\nworld')).toBe(false);
  });
});

describe('getColorLuminance (hover/active tints derived at module eval)', () => {
  // These exact outputs get baked into CSS custom properties when
  // styled-components is replaced — the values must not drift.
  it('darkens', () => {
    expect(getColorLuminance('#0077B5', -0.2)).toBe('#005f91');
  });
  it('lightens', () => {
    expect(getColorLuminance('#999999', 0.2)).toBe('#b8b8b8');
  });
  it('clamps to white', () => {
    expect(getColorLuminance('#FFFFFF', 0.5)).toBe('#ffffff');
  });
  it('returns invalid input unchanged', () => {
    expect(getColorLuminance('not-a-color', 0.2)).toBe('not-a-color');
  });
  it('handles 3-digit hex (previously produced #NaNNaNNaN)', () => {
    expect(getColorLuminance('#abc', 0)).toBe('#aabbcc');
  });
});
