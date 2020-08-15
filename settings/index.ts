import settings from 'electron-settings';

class Settings {
  static get(key?: string): any {
    if (key) return settings.getSync(key);
    return settings.getSync();
  }

  static set(key: string, value: any): any {
    return settings.setSync(key, value);
  }

  static delete(key?: string): void {
    if (key) settings.unsetSync(key);
    else settings.unsetSync();
  }

  static has(key: string): boolean {
    return settings.hasSync(key);
  }
}

export default Settings;

export const initialData = {
  version: undefined,
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
  data: null,
  theme: 'dark',
  input: '',
  shortcut: 'Ctrl+Alt+T'
};
