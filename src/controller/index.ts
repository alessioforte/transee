import { getHints, getTranslation, getReversoTranslation } from '../services';

const SET_LANGS = 'SET_LANGS';
const SET_THEME = 'SET_THEME';
const SET_SUGGESTIONS = 'SET_SUGGESTIONS';
const SET_GOOGLE = 'SET_GOOGLE';
const SET_REVERSO_TRANSLATION = 'SET_REVERSO_TRANSLATION';
const SET_INPUT = 'SET_INPUT';
const SET_SHORTCUT = 'SET_SHORTCUT';
const SET_LOADING = 'SET_LOADING';
const SET_ENGINE = 'SET_ENGINE';

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
  }
};

export const reducer = (state, action) => {
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
    default:
      return state;
  }
};

export const buildQueries = ({ actions, store }) => {
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
