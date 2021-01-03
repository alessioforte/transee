import { ipcRenderer } from 'electron';
import {
  getHints,
  // getReversoSuggest,
  getTranslation,
  // getReversoTranslation,
  playAudio,
} from '../services';
import Settings from '../../settings';
import { Action } from '../store/interfaces';

const SET_LANGS = 'SET_LANGS';
const SET_THEME = 'SET_THEME';
const SET_SUGGESTIONS = 'SET_SUGGESTIONS';
const SET_REVERSO_SUGGESTIONS = 'SET_REVERSO_SUGGESTIONS';
const SET_GOOGLE = 'SET_GOOGLE';
const SET_REVERSO = 'SET_REVERSO';
const SET_INPUT = 'SET_INPUT';
const SET_SEARCH = 'SET_SEARCH';
const SET_SHORTCUT = 'SET_SHORTCUT';
const SET_LOADING = 'SET_LOADING';
const SET_ENGINE = 'SET_ENGINE';
const SET_VOICE_SPEED = 'SET_VOICE_SPEED';
const SET_SHOW_WELCOME = 'SET_SHOW_WELCOME';
const SET_START_AT_LOGIN = 'SET_START_AT_LOGIN';
const SET_CHECK_UPDATES = 'SET_CHECK_UPDATES';
const RESTORE_SETTINGS = 'RESTORE_SETTINGS';
const CLEAR_DATA = 'CLEAR_DATA';
const ENABLE_ENGINES = 'ENABLE_ENGINES';

export const setters = {
  setLangs(payload: any): Action {
    return { type: SET_LANGS, payload };
  },
  setSuggestions(payload: []): Action {
    return { type: SET_SUGGESTIONS, payload };
  },
  setReversoSuggestions(payload: []): Action {
    return { type: SET_REVERSO_SUGGESTIONS, payload };
  },
  setGoogle(payload: any): Action {
    return { type: SET_GOOGLE, payload };
  },
  enableEngines(payload: boolean): Action {
    return { type: ENABLE_ENGINES, payload };
  },
  setReverso(payload: any): Action {
    return { type: SET_REVERSO, payload };
  },
  setInput(payload: string): Action {
    return { type: SET_INPUT, payload };
  },
  setShortcut(payload: string): Action {
    return { type: SET_SHORTCUT, payload };
  },
  setLoading(payload: boolean): Action {
    return { type: SET_LOADING, payload };
  },
  setEngine(payload: string): Action {
    return { type: SET_ENGINE, payload };
  },
  setSearch(payload: string): Action {
    return { type: SET_SEARCH, payload };
  },
  setShowWelcome(payload: boolean): Action {
    return { type: SET_SHOW_WELCOME, payload };
  },
  setStartAtLogin(payload: boolean): Action {
    return { type: SET_START_AT_LOGIN, payload };
  },
  setCheckUpdates(payload: boolean): Action {
    return { type: SET_CHECK_UPDATES, payload };
  },
  setTheme(payload: string): Action {
    return { type: SET_THEME, payload };
  },
  setVoiceSpeed(payload: boolean): Action {
    return { type: SET_VOICE_SPEED, payload };
  },
  restoreSettings(): Action {
    return { type: RESTORE_SETTINGS };
  },
  clearData(): Action {
    return { type: CLEAR_DATA };
  },
};

export const reducer = (state, action) => {
  switch (action.type) {
    case SET_LANGS:
      return { ...state, langs: action.payload };
    case SET_THEME:
      return { ...state, theme: action.payload };
    case SET_SUGGESTIONS:
      return { ...state, suggestions: action.payload };
    case SET_REVERSO_SUGGESTIONS:
      return { ...state, reversoSuggestions: action.payload };
    case SET_GOOGLE:
      return {
        ...state,
        google: action.payload.data,
        suggestions: action.payload.hints,
      };
    case ENABLE_ENGINES:
      state[action.payload.name] = action.payload.value;
      return { ...state };
    case SET_ENGINE:
      return { ...state, engine: action.payload };
    case SET_REVERSO:
      return { ...state, reverso: action.payload };
    case SET_INPUT:
      return { ...state, input: action.payload };
    case SET_SHORTCUT:
      return { ...state, shortcut: action.payload };
    case SET_LOADING:
      return { ...state, loading: action.payload };
    case SET_SEARCH:
      return { ...state, search: action.payload };
    case SET_SHOW_WELCOME:
      return { ...state, showWelcome: action.payload };
    case SET_START_AT_LOGIN:
      return { ...state, startAtLogin: action.payload };
    case SET_CHECK_UPDATES:
      return { ...state, checkUpdates: action.payload };
    case SET_VOICE_SPEED:
      return { ...state, speed: action.payload };
    case CLEAR_DATA:
      return {
        ...state,
        input: '',
        search: '',
        google: null,
        reverso: null,
        suggestions: [],
        speed: {
          from: true,
          to: true,
        },
      };
    case RESTORE_SETTINGS:
      return initialData;
    default:
      return state;
  }
};

export const buildActions = ({ setters }) => {
  const {
    setSuggestions,
    setReversoSuggestions,
    setGoogle,
    setInput,
    setLoading,
    setTheme,
    setReverso,
    setLangs,
    setShortcut,
    setEngine,
    setSearch,
    setShowWelcome,
    setStartAtLogin,
    setCheckUpdates,
    restoreSettings,
    clearData,
    setVoiceSpeed,
    enableEngines,
  } = setters;

  return {
    getData: async (text: string, langsSelected) => {
      setLoading(true);
      const isUppercase = /[A-Z]/.test(text);
      const hasDoubleSpace = /\s\s+/.test(text);
      const hasSpaceAtFirst = text && text.charAt(0) === ' ';
      const isNewLine = /\n/g.test(text);

      let hints: [] = [];
      if (
        !text ||
        isUppercase ||
        hasDoubleSpace ||
        hasSpaceAtFirst ||
        isNewLine
      ) {
        setSuggestions([]);
      } else {
        hints = (await getHints(text, langsSelected)) as [];
        // const reversoHints = await getReversoSuggest(text, langsSelected);
        // if (hints) {
        //   setSuggestions(hints);
        // }
      }

      if (!text) {
        setGoogle({ data: null, hints: [] });
        // setReverso(null);
      } else {
        const google = await getTranslation(text, langsSelected);
        if (google) {
          setGoogle({ data: google, hints: hints || [] });
        }
        // const reverso = await getReversoTranslation(text, langsSelected);
        // if (reverso) {
        //   setReverso(reverso);
        // }
      }
      setSearch(text);
      setLoading(false);
    },
    setLangs: (payload) => {
      setLangs(payload);
      Settings.set('langs', payload);
    },
    setTheme: (payload) => {
      setTheme(payload);
      Settings.set('theme', payload);
    },
    setShortcut: (payload) => {
      setShortcut(payload);
      Settings.set('shortcut', payload);
      ipcRenderer.send('change-shortcut', payload);
    },
    setEngine: (payload) => {
      setEngine(payload);
      Settings.set('engine', payload);
    },
    enableEngines: (payload) => {
      enableEngines(payload);
      Settings.set(payload.name, payload.value);
    },
    setShowWelcome: (payload) => {
      setShowWelcome(payload);
      Settings.set('showWelcome', payload);
    },
    setStartAtLogin: (payload) => {
      setStartAtLogin(payload);
      Settings.set('startAtLogin', payload);
      ipcRenderer.send('set-start-login', payload);
    },
    setCheckUpdates: (payload) => {
      setCheckUpdates(payload);
      Settings.set('checkUpdates', payload);
    },
    restoreSettings: (payload) => {
      restoreSettings(payload);
      Settings.delete();
      ipcRenderer.send('restore-settings');
    },
    clearData,
    setSuggestions,
    setReversoSuggestions,
    setGoogle,
    setReverso,
    setInput,
    setLoading,
    setSearch,
    playAudio: (text, lang, conversion, speed) => {
      const voiceSpeed = !speed[conversion];
      speed[conversion] = voiceSpeed;
      setVoiceSpeed(speed);
      playAudio(text, lang, voiceSpeed);
    },
  };
};

export const initialData = {
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
  suggestions: [],
  reversoSuggestions: [],
  google: null,
  reverso: null,
  googleEnabled: true,
  reversoEnabled: false,
  theme: 'dark',
  input: '',
  search: '',
  shortcut: 'Ctrl+Alt+T',
  showWelcome: true,
  startAtLogin: true,
  checkUpdates: true,
  engine: 'google',
  speed: {
    from: true,
    to: true,
  },
};
