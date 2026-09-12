import { create } from 'zustand';
import { Langs } from '@/types/langs';
import {
  bootSettings,
  appVersion,
  setSetting,
  setGlobalShortcut,
  setAutostart,
  restoreSettings as restoreSettingsOnDisk,
} from '@/platform';

/**
 * Everything that survives a restart. Writes go to the Tauri store through the
 * platform adapter; nothing in here talks to `@tauri-apps/*` directly.
 */
export type SettingsState = {
  langs: Langs;
  shortcut: string;
  showWelcome: boolean;
  startAtLogin: boolean;
  checkUpdates: boolean;
  version: string;

  setLangs: (langs: Langs) => void;
  setShortcut: (value: string) => void;
  setShowWelcome: (value: boolean) => void;
  setStartAtLogin: (value: boolean) => void;
  setCheckUpdates: (value: boolean) => void;
  restoreSettings: () => void;
};

export const defaultLangs: Langs = {
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
};

export const defaults = {
  langs: defaultLangs,
  shortcut: 'Ctrl+Alt+T',
  showWelcome: true,
  startAtLogin: false,
  checkUpdates: true,
};

export const useSettings = create<SettingsState>((set) => ({
  ...defaults,
  version: appVersion,
  // Injected by Rust before this module runs, so the first render already has
  // the user's real settings — no loading state, no flash of defaults.
  ...(bootSettings as Partial<SettingsState>),

  setLangs: (langs) => {
    set({ langs });
    setSetting('langs', langs);
  },

  setShortcut: (shortcut) => {
    set({ shortcut });
    // Rust persists the accelerator only once registration succeeds, so it can
    // never end up saved but unbound — unlike Electron, which ignored the
    // boolean `globalShortcut.register` returned.
    setGlobalShortcut(shortcut).catch((err) =>
      console.error('[transee] failed to set shortcut', err)
    );
  },

  setShowWelcome: (showWelcome) => {
    set({ showWelcome });
    setSetting('showWelcome', showWelcome);
  },

  setStartAtLogin: (startAtLogin) => {
    set({ startAtLogin });
    setSetting('startAtLogin', startAtLogin);
    setAutostart(startAtLogin);
  },

  setCheckUpdates: (checkUpdates) => {
    set({ checkUpdates });
    setSetting('checkUpdates', checkUpdates);
  },

  restoreSettings: () => {
    set({ ...defaults });
    // Clears the store and restarts. Electron called `app.relaunch()` with no
    // following `exit()`, so the advertised restart never happened.
    restoreSettingsOnDisk().catch((err) =>
      console.error('[transee] failed to restore settings', err)
    );
  },
}));
