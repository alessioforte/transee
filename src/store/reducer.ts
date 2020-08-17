const SET_LANGS = 'SET_LANGS';
const SET_THEME = 'SET_THEME';
const SET_SUGGESTIONS = 'SET_SUGGESTIONS';
const SET_DATA = 'SET_DATA';
const SET_INPUT = 'SET_INPUT';
const SET_SHORTCUT = 'SET_SHORTCUT';

export const actions = {
  setLangs(payload: any) {
    return { type: SET_LANGS, payload };
  },
  setSuggestions(payload: []) {
    return { type: SET_SUGGESTIONS, payload };
  },
  setData(payload: any) {
    return { type: SET_DATA, payload };
  },
  setInput(payload: string) {
    return { type: SET_INPUT, payload };
  },
  setShortcut(payload: string) {
    return { type: SET_SHORTCUT, payload };
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
    case SET_DATA:
      return { ...state, data: action.payload };
    case SET_INPUT:
      return { ...state, input: action.payload };
    case SET_SHORTCUT:
      return { ...state, shortcut: action.payload };
    default:
      return state;
  }
};
