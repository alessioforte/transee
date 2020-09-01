import { getHints, getTranslation, getReversoTranslation } from '../services';

const SET_LANGS = 'SET_LANGS';
const SET_THEME = 'SET_THEME';
const SET_SUGGESTIONS = 'SET_SUGGESTIONS';
const SET_GOOGLE = 'SET_GOOGLE';
const SET_REVERSO_TRANSLATION = 'SET_REVERSO_TRANSLATION';
const SET_INPUT = 'SET_INPUT';
const SET_SEARCH = 'SET_SEARCH';
const SET_SHORTCUT = 'SET_SHORTCUT';
const SET_LOADING = 'SET_LOADING';
const SET_ENGINE = 'SET_ENGINE';
const SET_SHOW_WELCOME = 'SET_SHOW_WELCOME';
const SET_START_AT_LOGIN = 'SET_START_AT_LOGIN';
const SET_CHECK_UPDATES = 'SET_CHECK_UPDATES';
const RESTORE_SETTINGS = 'RESTORE_SETTINGS';

export const actions = {
  setLangs(payload: any) {
    return { type: SET_LANGS, payload };
  },
  setSuggestions(payload: []) {
    return { type: SET_SUGGESTIONS, payload };
  },
  setGoogle(payload: any) {
    return { type: SET_GOOGLE, payload };
  },
  setReversoTranslation(payload: any) {
    return { type: SET_REVERSO_TRANSLATION, payload };
  },
  setInput(payload: string) {
    return { type: SET_INPUT, payload };
  },
  setShortcut(payload: string) {
    return { type: SET_SHORTCUT, payload };
  },
  setLoading(payload: boolean) {
    return { type: SET_LOADING, payload };
  },
  setEngine(payload: string) {
    return { type: SET_ENGINE, payload };
  },
  setSearch(payload: string) {
    return { type: SET_SEARCH, payload };
  },
  setShowWelcome(payload: boolean) {
    return { type: SET_SHOW_WELCOME, payload };
  },
  setStartAtLogin(payload: boolean) {
    return { type: SET_START_AT_LOGIN, payload };
  },
  setCheckUpdates(payload: boolean) {
    return { type: SET_CHECK_UPDATES, payload };
  },
  restoreSettings() {
    return { type: RESTORE_SETTINGS }
  }
};

export const reducer = (state, action) => {
  console.log('reducer', action.type)
  switch (action.type) {
    case SET_LANGS:
      return { ...state, langs: action.payload };
    case SET_THEME:
      return { ...state, theme: action.payload };
    case SET_SUGGESTIONS:
      return { ...state, suggestions: action.payload };
    case SET_GOOGLE:
      return { ...state, google: action.payload };
    case SET_ENGINE:
      return { ...state, engine: action.payload };
    case SET_REVERSO_TRANSLATION:
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
    case RESTORE_SETTINGS:
      //   // ipcRenderer.send('restore-settings');
      return initialData;
    default:
      return state;
  }
};

export const buildQueries = ({ actions }) => {
  const {
    setSuggestions,
    setGoogle,
    setInput,
    setLoading,
    setReversoTranslation,
  } = actions;

  return {
    getData: async (text: string, langsSelected) => {
      setLoading(true);
      const isUppercase = /[A-Z]/.test(text);
      const hasDoubleSpace = /\s\s+/.test(text);
      const hasSpaceAtFirst = text.charAt(0) === ' ';
      const isNewLine = /^\s*$/.test(text);
      if (
        !text ||
        isUppercase ||
        hasDoubleSpace ||
        hasSpaceAtFirst ||
        isNewLine
      ) {
        setSuggestions([]);
      } else {
        const hints: [] = (await getHints(text, langsSelected)) as [];
        if (hints) {
          setSuggestions(hints);
        }
      }

      if (!text) {
        setGoogle(null);
      } else {
        const translation = await getTranslation(text, langsSelected);
        const reverso = await getReversoTranslation(text, langsSelected);
        if (translation) {
          setGoogle(translation);
        }
        if (reverso) {
          setReversoTranslation(reverso);
        }
      }
      setInput(text);
      setLoading(false);
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
  google: null,
  reverso: null,
  theme: 'dark',
  input: '',
  search: '',
  shortcut: 'Ctrl+Alt+T',
  showWelcome: true,
  startAtLogin: true,
  checkUpdates: true,
  engine: 'google',
};

// const settings = {
//   version: '1.2.5',
//   'show-welcome': false,
//   'start-login': true,
//   shortcut: 'Ctrl+Alt+T',
//   settings: {
//     langs: {
//       from: 'en',
//       to: 'it',
//     },
//     speed: {
//       from: false,
//       to: false,
//     },
//     fromActive: [true, false, false],
//     toActive: [true, false, false],
//     fromBar: {
//       from1: 'en',
//       from2: 'it',
//       from3: 'es',
//     },
//     toBar: {
//       to1: 'it',
//       to2: 'en',
//       to3: 'es',
//     },
//   },
//   TKK: '443297.4016894073',
// };
