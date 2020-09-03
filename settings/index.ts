import settings from 'electron-settings';

class Settings {
  static get(key?: string): any {
    if (key) return settings.getSync(key);
    return settings.getSync();
  }

  static set(key: string, value: any): void {
    settings.setSync(key, value);
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
