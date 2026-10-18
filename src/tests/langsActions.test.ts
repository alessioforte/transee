import { describe, expect, it } from 'vitest';
import {
  selectLangs,
  invertLangs,
  detectedOption,
  resolveSource,
  canSpeak,
  normalizeLangs,
} from '@/features/translation/LangsBar/actions';
import { Conversion, Langs } from '@/features/translation/LangsBar/interfaces';
import { AUTO, langsFrom, langsTo, ttsLangs } from '@/features/translation/langs';

// Fresh copy per test, so no test can observe another one's state.
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

  it('leaves the previous state untouched', () => {
    const prev = defaults();
    prev.selected = { from: 'es', to: 'it' };
    prev.threesome.to[2] = { value: 'fr', label: 'French' };
    const snapshot = JSON.parse(JSON.stringify(prev));
    invertLangs(prev);
    expect(prev).toEqual(snapshot);
  });
});

describe('auto (detect language)', () => {
  const withAuto = (): Langs => ({
    threesome: {
      from: [
        { value: AUTO, label: 'Detect language' },
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
      ],
      to: [
        { value: 'it', label: 'Italian' },
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
      ],
    },
    selected: { from: AUTO, to: 'it' },
  });

  it('does not invert before anything is detected', () => {
    const prev = withAuto();
    expect(invertLangs(prev)).toBe(prev);
  });

  it('does not invert when the detected language is the target', () => {
    const prev = withAuto();
    expect(invertLangs(prev, { value: 'it', label: 'Italian' })).toBe(prev);
  });

  it('inverts with a detected language already in the bar', () => {
    const next = invertLangs(withAuto(), { value: 'en', label: 'English' });
    expect(next.selected).toEqual({ from: 'it', to: 'en' });
    expect(next.threesome.to.map((o) => o.value)).not.toContain(AUTO);
  });

  it('inverts with a detected language outside the bar', () => {
    const next = invertLangs(withAuto(), { value: 'de', label: 'German' });
    expect(next.selected).toEqual({ from: 'it', to: 'de' });
    expect(next.threesome.to).toContainEqual({ value: 'de', label: 'German' });
    expect(next.threesome.to.map((o) => o.value)).not.toContain(AUTO);
    expect(next.threesome.from).toContainEqual({ value: 'it', label: 'Italian' });
  });

  it('never swaps auto onto the target side', () => {
    const next = selectLangs(withAuto(), Conversion.from, {
      value: 'it',
      label: 'Italian',
    });
    expect(next.selected.from).toBe('it');
    expect(next.selected.to).not.toBe(AUTO);
    expect(next.selected.to).not.toBe('it');
  });

  it('exposes the detected language only while auto is selected', () => {
    expect(detectedOption({ from: AUTO, to: 'it' }, 'de')).toEqual({
      value: 'de',
      label: 'German',
    });
    expect(detectedOption({ from: AUTO, to: 'it' }, null)).toBeUndefined();
    expect(detectedOption({ from: 'en', to: 'it' }, 'en')).toBeUndefined();
  });

  it('resolves the source language for speech', () => {
    expect(resolveSource({ from: AUTO, to: 'it' }, 'de')).toBe('de');
    expect(resolveSource({ from: AUTO, to: 'it' }, null)).toBeNull();
    expect(resolveSource({ from: 'en', to: 'it' }, 'de')).toBe('en');
  });
});

describe('canSpeak', () => {
  it('follows the GetSupportedTtsLanguages list', () => {
    expect(canSpeak('en')).toBe(true);
    expect(canSpeak('zh-CN')).toBe(true);
    expect(canSpeak('ace')).toBe(false);
    expect(canSpeak(AUTO)).toBe(false);
    expect(canSpeak(null)).toBe(false);
  });
});

describe('normalizeLangs (settings saved by older versions)', () => {
  it('replaces the invalid Punjabi code and refreshes renamed labels', () => {
    const saved: Langs = {
      threesome: {
        from: [
          { value: 'en', label: 'English' },
          { value: 'ma', label: 'Punjabi' },
          { value: 'zh-CN', label: 'Chinese' },
        ],
        to: [
          { value: 'it', label: 'Italian' },
          { value: 'zh-CN', label: 'Chinese Simplified' },
          { value: 'ma', label: 'Punjabi' },
        ],
      },
      selected: { from: 'ma', to: 'zh-CN' },
    };
    const next = normalizeLangs(saved);
    expect(next.selected).toEqual({ from: 'pa', to: 'zh-CN' });
    expect(next.threesome.from[1]).toEqual({ value: 'pa', label: 'Punjabi (Gurmukhi)' });
    expect(next.threesome.from[2]).toEqual({ value: 'zh-CN', label: 'Chinese (Simplified)' });
    expect(next.threesome.to[1]).toEqual({ value: 'zh-CN', label: 'Chinese (Simplified)' });
    expect(next.threesome.to[2]).toEqual({ value: 'pa', label: 'Punjabi (Gurmukhi)' });
  });

  it('keeps current settings and unknown codes as they are', () => {
    const saved = defaults();
    saved.threesome.to[2] = { value: 'xx', label: 'Unknown' };
    expect(normalizeLangs(saved)).toEqual(saved);
  });

  it('returns malformed data unchanged', () => {
    const broken = { selected: { from: 'en', to: 'it' } } as unknown as Langs;
    expect(normalizeLangs(broken)).toBe(broken);
  });
});

describe('language catalogue', () => {
  it('offers auto as a source only', () => {
    expect(Object.keys(langsFrom)[0]).toBe(AUTO);
    expect(langsTo[AUTO]).toBeUndefined();
  });

  it('offers every target as a source', () => {
    for (const code of Object.keys(langsTo)) expect(langsFrom[code]).toBe(langsTo[code]);
  });

  it('only lists voices for languages it can translate into', () => {
    for (const code of ttsLangs) {
      if (code === 'zh') continue; // GetTts accepts bare `zh`; the catalogue uses zh-CN/zh-TW
      expect(langsTo[code], code).toBeDefined();
    }
  });
});
