import {
  getGoogleTranslate,
  getGoogleSuggest,
  getGoogleVoice,
} from '../services/api';
import create, { StateCreator } from 'zustand'
import { Langs, Store } from '../interfaces'
import mapping from '@/utils/mapping';
import { validateInput } from '@/utils';
import {
  setSetting,
  setGlobalShortcut,
  setAutostart,
  restoreSettings as restoreSettingsOnDisk,
} from '@/platform';


export const initialState = {
  langs: {
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
  },
  loading: false,
  suggestions: [],
  google: null,
  reverso: null,
  theme: 'dark',
  input: '',
  search: '',
  payload: null,
  shortcut: 'Ctrl+Alt+T',
  showWelcome: true,
  startAtLogin: true,
  checkUpdates: true,
  engine: 'google',
  version: '2.1.0',
  error: false,
  speed: {
    from: true,
    to: true,
  }
};

const store: StateCreator<Store> = (set) => ({
  ...initialState,
  getData: async (text: string, langsSelected: any) => {
    set({ loading: true })

    const isValid = validateInput(text)

    if (!isValid) {
      set({ suggestions: [] })
    } else {
      track(getGoogleSuggest(text, langsSelected), 'hints')
    }

    if (!text) {
      set({ google: null, suggestions: [], payload: null, loading: false, error: false })
    } else {
      track(getGoogleTranslate(text, langsSelected), 'translation')
    }
    set({ search: text })
  },

  setLangs: (langs: Langs) => {
    set({ langs })
    setSetting('langs', langs)
  },
  setShortcut: (shortcut: string) => {
    set({ shortcut })
    // Rust persists the accelerator itself once registration succeeds, so it
    // cannot end up saved but unbound.
    setGlobalShortcut(shortcut).catch((err) =>
      console.error('[transee] failed to set shortcut', err)
    );
  },
  setShowWelcome: (showWelcome: boolean) => {
    set({ showWelcome })
    setSetting('showWelcome', showWelcome);
  },
  setStartAtLogin: (startAtLogin: boolean) => {
    set({ startAtLogin })
    setSetting('startAtLogin', startAtLogin);
    setAutostart(startAtLogin);
  },
  setCheckUpdates: (checkUpdates: boolean) => {
    set({ checkUpdates });
    setSetting('checkUpdates', checkUpdates);
  },
  restoreSettings: () => {
    set(state => ({ ...state, ...initialState }))
    // Clears the store and restarts. Electron called `app.relaunch()` with no
    // following `exit()`, so the advertised restart never happened.
    restoreSettingsOnDisk().catch((err) =>
      console.error('[transee] failed to restore settings', err)
    );
  },
  clearData: () => set(state => ({
    ...state,
    input: '',
    search: '',
    payload: '',
    google: null,
    reverso: null,
    suggestions: [],
    error: false,
    speed: {
      from: true,
      to: true,
    },
  })),
  setSuggestions: (suggestions: any) => set({ suggestions }),
  setGoogle: (google: any) => set({ google }),
  setError: (error: boolean) => set({ error }),
  setInput: (text: string) => set({ input: text }),
  setLoading: (loading: boolean) => set({ loading }),
  setSearch: (text: string) => set({ search: text }),
  playAudio: (text: string, lang: string, conversion: string, speed: any) => {
    const voiceSpeed = !speed[conversion];
    speed[conversion] = voiceSpeed;
    set({ speed })
    track(getGoogleVoice(text, lang, voiceSpeed), 'voice');
  },
})

export const useStore = create(store)


/**
 * Response handling
 *
 * Under Electron this lived in a module-level `ipcRenderer.on('response')`
 * listener, which every window registered on import and none ever removed.
 * The requests are real promises now, so the same logic hangs off their
 * resolution instead.
 */

const parser = (data: string) => {
  const sliced = (data).slice(5);
  let parsedURI = sliced;
  try {
    parsedURI = decodeURI(sliced);
  } catch (err) {
    parsedURI = sliced;
  }
  const parsed = JSON.parse(parsedURI);
  return JSON.parse(parsed[0][2]);
}

function track(request: Promise<string>, operation: string) {
  request.then(
    (response) => onResponse(response, operation),
    (err) => onError(err, operation)
  );
}

async function onResponse(response: string, operation: string) {
  switch (operation) {
    case 'hints':
      if (response) {
        const hints = parser(response)
        const suggestions = hints && hints[0];
        useStore.setState({ suggestions })
      }
      break;
    case 'translation': {
      const tr = parser(response)
      const google = mapping(tr);
      if (google) {
        let payload: null | string = null;
        if (google.translation[1] && google.translation[1][0]) {
          payload = google.translation[1][0];
        } else if (
          google.translation[0][5] &&
          google.translation[0][5][0][0]
        ) {
          payload = google.translation[0][5][0][0];
        }
        useStore.setState({ google, payload })
      }
      break;
    }
    case 'voice':
      if (response) {
        const data = parser(response)
        const voice = decodeURI(data[0]);
        const decoded = Uint8Array.from(window.atob(voice), (e) => e.charCodeAt(0));
        const context = new AudioContext();
        const source = context.createBufferSource();
        const audioBuffer = await context.decodeAudioData(decoded.buffer);
        source.buffer = audioBuffer;
        source.connect(context.destination);
        source.start(0);
      }
      break;
  }

  useStore.setState({ loading: false, error: false })
}

function onError(err: unknown, operation: string) {
  console.error({ operation, err })
  // The Electron build could never reach this: 'error' was missing from the
  // preload channel whitelist, so `loading` stayed true forever when a request
  // failed and the spinner span offline.
  useStore.setState({ error: true, loading: false })
}
