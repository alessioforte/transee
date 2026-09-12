import { create } from 'zustand';
import {
  getGoogleTranslate,
  getGoogleSuggest,
  getGoogleVoice,
} from '../services/google/client';
import {
  parseSuggestions,
  parseTranslation,
  parseVoice,
  pickPayload,
  Mapped,
} from '../services/google/parse';
import { play } from '../services/audio';
import { validateInput } from '@/utils';
import { Selected } from '@/types/langs';

export type Speed = { from: boolean; to: boolean };

export type TranslationState = {
  input: string;
  search: string;
  payload: string | null;
  suggestions: [string, string][];
  google: Mapped | null;
  loading: boolean;
  error: boolean;
  speed: Speed;

  getData: (text: string, langs: Selected) => void;
  clearData: () => void;
  setInput: (text: string) => void;
  setSuggestions: (suggestions: [string, string][]) => void;
  playAudio: (text: string, lang: string, conversion: keyof Speed) => void;
};

const empty = {
  input: '',
  search: '',
  payload: null,
  suggestions: [] as [string, string][],
  google: null,
  loading: false,
  error: false,
  speed: { from: true, to: true },
};

/**
 * Monotonic request id. Responses are correlated by nothing but their operation
 * name in the Electron build, so typing quickly could let a slow translation
 * land after — and overwrite — a newer one. Anything from an older generation
 * is now discarded.
 */
let generation = 0;

export const useTranslation = create<TranslationState>((set, get) => ({
  ...empty,

  getData: (text, langs) => {
    const current = ++generation;
    const fresh = () => current === generation;

    if (!text) {
      set({ google: null, suggestions: [], payload: null, loading: false, error: false, search: text });
      return;
    }

    set({ loading: true, search: text });

    if (validateInput(text)) {
      getGoogleSuggest(text, langs)
        .then((res) => fresh() && set({ suggestions: parseSuggestions(res) }))
        .catch((err) => fresh() && fail(set, err, 'hints'));
    } else {
      set({ suggestions: [] });
    }

    getGoogleTranslate(text, langs)
      .then((res) => {
        if (!fresh()) return;
        const google = parseTranslation(res);
        // `loading` is cleared here and nowhere else. It used to be cleared by
        // whichever response arrived first, so a fast suggestions reply stopped
        // the spinner while the translation was still in flight.
        set({ google, payload: pickPayload(google), loading: false, error: false });
      })
      .catch((err) => fresh() && fail(set, err, 'translation'));
  },

  clearData: () => set({ ...empty }),

  setInput: (input) => set({ input }),

  setSuggestions: (suggestions) => set({ suggestions }),

  playAudio: (text, lang, conversion) => {
    // Toggles between normal and slow on repeated presses. The old version
    // mutated the existing speed object before handing it back to `set`.
    const speed = { ...get().speed, [conversion]: !get().speed[conversion] };
    set({ speed });
    getGoogleVoice(text, lang, speed[conversion])
      .then((res) => play(parseVoice(res)))
      .catch((err) => console.error('[transee] voice failed', err));
  },
}));

function fail(
  set: (partial: Partial<TranslationState>) => void,
  err: unknown,
  operation: string
) {
  console.error('[transee] request failed', { operation, err });
  // Unreachable under Electron: 'error' was missing from the preload channel
  // whitelist, so a failed request left `loading` true and the spinner ran
  // forever whenever the machine was offline.
  set({ error: true, loading: false });
}
