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
  speed: {
    from: true,
    to: true,
  },
};
