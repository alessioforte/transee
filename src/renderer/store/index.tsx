import {
  getGoogleTranslate,
  getGoogleSuggest,
  getGoogleVoice,
} from '../services/api';
import create, { StateCreator } from 'zustand'
import { Langs, Store } from '../interfaces'
import mapping from 'renderer/utils/mapping';
import { validateInput } from 'renderer/utils';


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
  reversoSuggestions: [],
  google: null,
  reverso: null,
  googleEnabled: true,
  reversoEnabled: false,
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
      getGoogleSuggest(text, langsSelected)
    }

    if (!text) {
      set({ google: null, suggestions: [], payload: null, loading: false, error: false })
    } else {
      getGoogleTranslate(text, langsSelected);
    }
    set({ search: text })
  },

  setLangs: (langs: Langs) => {
    set({ langs })
    window.electron.store.set('langs', langs)
  },
  // setTheme: (payload) => {
  //   setTheme(payload);
  //   // Settings.set('theme', payload);
  // },
  setShortcut: (shortcut: string) => {
    set({ shortcut })
    window.electron.store.set('shortcut', shortcut);
    window.electron.ipcRenderer.send('change-shortcut', shortcut);
  },
  // setEngine: (payload) => {
  //   setEngine(payload);
  //   // Settings.set('engine', payload);
  // },
  // enableEngines: (payload) => {
  //   enableEngines(payload);
  //   // Settings.set(payload.name, payload.value);
  // },
  setShowWelcome: (showWelcome: boolean) => {
    set({ showWelcome })
    window.electron.store.set('showWelcome', showWelcome);
  },
  setStartAtLogin: (startAtLogin: boolean) => {
    set({ startAtLogin })
    window.electron.store.set('startAtLogin', startAtLogin);
    window.electron.ipcRenderer.send('set-start-login', startAtLogin);
  },
  setCheckUpdates: (checkUpdates: boolean) => {
    set({ checkUpdates });
    window.electron.store.set('checkUpdates', checkUpdates);
  },
  restoreSettings: () => {
    set(state => ({ ...state, ...initialState }))
    window.electron.store.clear();
    window.electron.ipcRenderer.send('restore-settings', null);
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
  // setReversoSuggestions,
  setGoogle: (google: any) => set({ google }),
  // setReverso,
  setError: (error: boolean) => set({ error }),
  setInput: (text: string) => set({ input: text }),
  setLoading: (loading: boolean) => set({ loading }),
  setSearch: (text: string) => set({ search: text }),
  playAudio: (text: string, lang: string, conversion: string, speed: any) => {
    const voiceSpeed = !speed[conversion];
    speed[conversion] = voiceSpeed;
    set({ speed })
    getGoogleVoice(text, lang, voiceSpeed);
  },
})

export const useStore = create(store)


/**
 * Event Listener
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

window.electron.ipcRenderer.on('response', async (response, operation) => {
  switch (operation) {
    case 'hints':
      if (response) {
        // const decode = JSON.parse(decodeURI((response as string).slice(5)));
        // const data = JSON.parse(decode[0][2]);
        const hints = parser(response as string)
        const suggestions = hints && hints[0];
        useStore.setState({ suggestions })  
      }
      break;
    case 'translation':
      // const decode = JSON.parse(decodeURI((response as string).slice(5)));
      // const data = JSON.parse(decode[0][2]);
      const tr = parser(response as string)
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
    case 'voice':
      if (response) {
        // const decode = JSON.parse(decodeURI((response as string).slice(5)));
        // const data = JSON.parse(decode[0][2]);
        const data = parser(response as string)
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
})

window.electron.ipcRenderer.on('error', async (response, operation) => {
  console.error({ operation, response })
  useStore.setState({ error: true })
})