import { describe, expect, it } from 'vitest';
import { selectLangs, invertLangs } from '@/features/translation/LangsBar/actions';
import { Conversion, Langs } from '@/features/translation/LangsBar/interfaces';

// Fresh copy per test: invertLangs shallow-copies `threesome`, so it mutates
// the caller's arrays — a quirk the tests must not share state through.
const defaults = (): Langs => ({
  threesome: {
    from: [
      { value: 'en', label: 'English' },
      { value: 'it', label: 'Italian' },
      { value: 'es', label: 'Spanish' },
    ],
    to: [
      { value: 'it', label: 'Italian' },
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
    ],
  },
  selected: { from: 'en', to: 'it' },
});

describe('selectLangs', () => {
  it('selects a language already in the threesome', () => {
    const next = selectLangs(defaults(), Conversion.from, {
      value: 'es',
      label: 'Spanish',
    });
    expect(next.selected).toEqual({ from: 'es', to: 'it' });
    expect(next.threesome).toEqual(defaults().threesome);
  });

  it('swaps sides when selecting the language active on the other side', () => {
    const next = selectLangs(defaults(), Conversion.from, {
      value: 'it',
      label: 'Italian',
    });
    expect(next.selected).toEqual({ from: 'it', to: 'en' });
  });

  it('replaces the active slot when selecting a language outside the threesome', () => {
    const next = selectLangs(defaults(), Conversion.to, {
      value: 'fr',
      label: 'French',
    });
    expect(next.selected).toEqual({ from: 'en', to: 'fr' });
    // 'it' was the active `to` slot (index 0) and gets replaced by French
    expect(next.threesome.to[0]).toEqual({ value: 'fr', label: 'French' });
    expect(next.threesome.from).toEqual(defaults().threesome.from);
  });
});

describe('invertLangs', () => {
  it('swaps selected languages when both exist on both sides', () => {
    const next = invertLangs(defaults());
    expect(next.selected).toEqual({ from: 'it', to: 'en' });
    expect(next.threesome).toEqual(defaults().threesome);
  });

  it('carries options across when a side is missing the counterpart', () => {
    const prev: Langs = {
      threesome: {
        from: [
          { value: 'en', label: 'English' },
          { value: 'it', label: 'Italian' },
          { value: 'es', label: 'Spanish' },
        ],
        to: [
          { value: 'it', label: 'Italian' },
          { value: 'en', label: 'English' },
          { value: 'fr', label: 'French' },
        ],
      },
      selected: { from: 'es', to: 'fr' },
    };
    const next = invertLangs(prev);
    expect(next.selected).toEqual({ from: 'fr', to: 'es' });
    expect(next.threesome.from[2]).toEqual({ value: 'fr', label: 'French' });
    expect(next.threesome.to[2]).toEqual({ value: 'es', label: 'Spanish' });
  });
});
