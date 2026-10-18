import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/google/client', () => ({
  getTranslation: vi.fn(),
  getGoogleDictionary: vi.fn(),
  getGoogleSuggest: vi.fn(),
  getGoogleVoice: vi.fn(),
}));
vi.mock('@/services/audio', () => ({ play: vi.fn() }));

import {
  getTranslation,
  getGoogleDictionary,
  getGoogleSuggest,
} from '@/services/google/client';
import { GoogleDictionary } from '@/services/google/dictionary';
import { Mapped } from '@/services/google/parse';
import { useTranslation } from '@/stores/translation';

const translate = vi.mocked(getTranslation);
const dictionary = vi.mocked(getGoogleDictionary);
const suggest = vi.mocked(getGoogleSuggest);
const langs = { from: 'en', to: 'it' };

function result(text = 'correre', source: string | null = 'en'): Mapped {
  return {
    pronunciation: null,
    correction: null,
    translation: [[text]],
    input: null,
    source,
    definitions: null,
    examples: null,
    seeAlso: null,
    synonyms: null,
    translations: null,
  };
}

function cards(headword = 'run'): GoogleDictionary {
  return {
    headword,
    translations: [],
    definitions: [],
    synonyms: [],
    examples: [`An example of ${headword}.`],
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

// Allow both the primary and optional request chains to settle, including
// their rejection handlers, without coupling the test to a microtask count.
const settled = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('translation store request lifecycle', () => {
  beforeEach(() => {
    useTranslation.getState().clearData();
    vi.resetAllMocks();
    translate.mockResolvedValue(result());
    dictionary.mockResolvedValue(null);
    suggest.mockResolvedValue(`)]}'\n\n[["wrb.fr","AVdN8","[[]]"]]`);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    useTranslation.getState().clearData();
    vi.restoreAllMocks();
  });

  it('renders the primary translation while dictionary cards are pending', async () => {
    const pending = deferred<GoogleDictionary | null>();
    const primary = result();
    const rich = cards();
    translate.mockResolvedValue(primary);
    dictionary.mockReturnValue(pending.promise);

    useTranslation.getState().getData('run', langs);
    await settled();

    expect(useTranslation.getState()).toMatchObject({
      google: primary,
      payload: 'correre',
      loading: false,
      error: false,
      dictionaryLoading: true,
      dictionaryError: false,
    });

    pending.resolve(rich);
    await settled();

    expect(useTranslation.getState().google).toEqual({
      ...primary,
      dictionary: rich,
    });
    expect(useTranslation.getState().dictionaryLoading).toBe(false);
    expect(primary).not.toHaveProperty('dictionary');
  });

  it('keeps the primary result when the optional dictionary request fails', async () => {
    const primary = result();
    translate.mockResolvedValue(primary);
    dictionary.mockRejectedValue(new Error('dictionary unavailable'));

    useTranslation.getState().getData('run', langs);
    await settled();

    expect(useTranslation.getState()).toMatchObject({
      google: primary,
      payload: 'correre',
      loading: false,
      error: false,
      dictionaryLoading: false,
      dictionaryError: true,
    });
  });

  it('treats absent dictionary cards as an ordinary empty result', async () => {
    const primary = result();
    translate.mockResolvedValue(primary);
    dictionary.mockResolvedValue(null);

    useTranslation.getState().getData('run', langs);
    await settled();

    expect(useTranslation.getState().google).toBe(primary);
    expect(useTranslation.getState().dictionaryLoading).toBe(false);
    expect(useTranslation.getState().dictionaryError).toBe(false);
    expect(useTranslation.getState().error).toBe(false);
  });

  it('does not end primary loading when suggestions fail first', async () => {
    const pending = deferred<Mapped>();
    translate.mockReturnValue(pending.promise);
    suggest.mockRejectedValue(new Error('suggestions unavailable'));

    useTranslation.getState().getData('run', langs);
    await settled();

    expect(useTranslation.getState()).toMatchObject({
      google: null,
      suggestions: [],
      loading: true,
      error: false,
      dictionaryLoading: false,
    });
    expect(dictionary).not.toHaveBeenCalled();

    pending.resolve(result());
    await settled();
    expect(useTranslation.getState().payload).toBe('correre');
    expect(useTranslation.getState().loading).toBe(false);
  });

  it.each([
    { source: 'de', selected: 'auto', expected: 'de' },
    { source: null, selected: 'en', expected: 'en' },
    { source: null, selected: 'auto', expected: 'auto' },
  ])('uses $expected for source cards when detection returns $source', async ({ source, selected, expected }) => {
    translate.mockResolvedValue(result('correre', source));

    useTranslation.getState().getData('run', { from: selected, to: 'it' });
    await settled();

    expect(dictionary).toHaveBeenCalledWith('run', {
      from: expected,
      to: 'it',
    });
  });

  it('clears the old result immediately and rejects cards from an older query', async () => {
    const oldCards = deferred<GoogleDictionary | null>();
    const newPrimary = deferred<Mapped>();
    const currentCards = cards('walk');
    translate.mockResolvedValueOnce(result()).mockReturnValueOnce(newPrimary.promise);
    dictionary.mockReturnValueOnce(oldCards.promise).mockResolvedValueOnce(currentCards);

    useTranslation.getState().getData('run', langs);
    await settled();
    expect(useTranslation.getState().dictionaryLoading).toBe(true);

    useTranslation.getState().getData('walk', langs);
    expect(useTranslation.getState()).toMatchObject({
      google: null,
      payload: null,
      suggestions: [],
      search: 'walk',
      loading: true,
      error: false,
      dictionaryLoading: false,
      dictionaryError: false,
    });

    oldCards.resolve(cards());
    await settled();
    expect(useTranslation.getState().google).toBeNull();
    expect(useTranslation.getState().loading).toBe(true);

    newPrimary.resolve(result('camminare'));
    await settled();
    expect(useTranslation.getState().google?.dictionary).toEqual(currentCards);
    expect(useTranslation.getState().payload).toBe('camminare');
  });

  it('ignores dictionary failures from an older query', async () => {
    const oldCards = deferred<GoogleDictionary | null>();
    dictionary.mockReturnValueOnce(oldCards.promise).mockResolvedValueOnce(cards('walk'));

    useTranslation.getState().getData('run', langs);
    await settled();
    translate.mockResolvedValue(result('camminare'));
    useTranslation.getState().getData('walk', langs);
    await settled();

    oldCards.reject(new Error('old dictionary failed'));
    await settled();

    expect(useTranslation.getState().payload).toBe('camminare');
    expect(useTranslation.getState().google?.dictionary?.headword).toBe('walk');
    expect(useTranslation.getState().dictionaryError).toBe(false);
  });

  it('invalidates dictionary results when the user clears the bar', async () => {
    const pending = deferred<GoogleDictionary | null>();
    dictionary.mockReturnValue(pending.promise);
    useTranslation.getState().getData('run', langs);
    await settled();

    useTranslation.getState().clearData();
    pending.resolve(cards());
    await settled();

    expect(useTranslation.getState()).toMatchObject({
      google: null,
      payload: null,
      search: '',
      loading: false,
      error: false,
      dictionaryLoading: false,
      dictionaryError: false,
    });
  });

  it('invalidates pending primary and suggestion responses on clear', async () => {
    const primary = deferred<Mapped>();
    const hints = deferred<string>();
    translate.mockReturnValue(primary.promise);
    suggest.mockReturnValue(hints.promise);
    useTranslation.getState().getData('run', langs);
    useTranslation.getState().clearData();

    primary.resolve(result());
    hints.resolve(`)]}'\n\n[["wrb.fr","AVdN8","[[[\\"run\\",\\"correre\\"]]]"]]`);
    await settled();

    expect(useTranslation.getState().google).toBeNull();
    expect(useTranslation.getState().suggestions).toEqual([]);
    expect(useTranslation.getState().loading).toBe(false);
    expect(dictionary).not.toHaveBeenCalled();
  });

  it.each([' ', 'x'.repeat(201), 'two\nlines', 'https://example.com/'])(
    'keeps plain translation available for input without dictionary cards: %s',
    async (text) => {
      useTranslation.getState().getData(text, langs);
      await settled();

      expect(translate).toHaveBeenCalledWith(text, langs);
      expect(useTranslation.getState().payload).toBe('correre');
      expect(useTranslation.getState().dictionaryLoading).toBe(false);
      expect(dictionary).not.toHaveBeenCalled();
    }
  );
});
