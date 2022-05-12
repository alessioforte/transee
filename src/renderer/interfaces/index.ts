export interface Option {
  value: string
  label: string
}

export interface Threesome {
  from: Option[]
  to: Option[]
}

export interface Langs {
  threesome: Threesome
  selected: {
    from: string
    to: string
  }
}
// TODO resolve any
export interface Store {
  langs: Langs,
  loading: boolean
  suggestions: any
  reversoSuggestions: any
  google: any
  reverso: any
  googleEnabled: boolean
  reversoEnabled: boolean
  theme: string
  input: string
  search: string,
  payload: any
  shortcut: string
  showWelcome: boolean
  startAtLogin: boolean
  checkUpdates: boolean
  engine: string // TODO create enum
  version: string
  error: boolean
  speed: {
    from: boolean
    to: boolean
  },

  getData: (text: string, langsSelected: any) => void
  setLangs: (langs: Langs) => void
  setShortcut: (value: string) => void
  setShowWelcome: (value: boolean) => void
  setStartAtLogin: (value: boolean) => void
  setCheckUpdates: (value: boolean) => void
  restoreSettings: () => void
  setSuggestions: (data: any) => void
  setGoogle: (data: any) => void
  setError: (value: boolean) => void
  setInput: (text: string) => void
  setLoading: (loading: boolean) => void
  clearData: () => void
  setSearch: (text: string) => void
  playAudio: (text: string, lang: string, conversion: string, speed: any) => void
}