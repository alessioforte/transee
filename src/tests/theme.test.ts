import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/platform', () => ({
  bootSettings: { theme: 'light' },
  appVersion: '3.0.0',
  isMac: true,
  setSetting: vi.fn().mockResolvedValue(undefined),
  setWindowTheme: vi.fn(),
  watchSetting: vi.fn(),
  setGlobalShortcut: vi.fn().mockResolvedValue(undefined),
  setAutostart: vi.fn(),
  restoreSettings: vi.fn().mockResolvedValue(undefined),
}));

import { setSetting, setWindowTheme, watchSetting } from '@/platform';
import { initializeTheme } from '@/app/theme';
import { defaults, useSettings } from '@/stores/settings';
import { normalizeTheme } from '@/types/theme';
import Preferences from '@/features/settings/PreferencesWindow';

describe('theme preference in every window', () => {
  let receive: (value: unknown, initial: boolean) => void;
  let dispose: (() => void) | undefined;
  const unlisten = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    useSettings.setState({ ...defaults, theme: 'light' });
    vi.mocked(watchSetting).mockImplementation(async (_key, callback) => {
      receive = callback;
      return unlisten;
    });
  });

  afterEach(() => {
    dispose?.();
    dispose = undefined;
    delete document.documentElement.dataset.theme;
    vi.unstubAllGlobals();
  });

  it('applies the saved theme before rendering and retains dark as the default', () => {
    dispose = initializeTheme();
    expect(defaults.theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(setWindowTheme).toHaveBeenCalledWith('light');
    expect(watchSetting).toHaveBeenCalledWith('theme', expect.any(Function));
    expect(setSetting).not.toHaveBeenCalled();
  });

  it('saves a local selection and applies changes from other windows without writing back', () => {
    dispose = initializeTheme();
    useSettings.getState().setTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(setSetting).toHaveBeenCalledExactlyOnceWith('theme', 'dark');

    receive('light', false);
    expect(useSettings.getState().theme).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(setWindowTheme).toHaveBeenLastCalledWith('light');
    expect(setSetting).toHaveBeenCalledTimes(1);
  });

  it('catches up changes made between native bootstrap and subscription', () => {
    dispose = initializeTheme();
    receive('dark', true);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(setSetting).not.toHaveBeenCalled();
  });

  it('does not let a delayed initial read undo a local choice', () => {
    dispose = initializeTheme();
    useSettings.getState().setTheme('dark');
    receive('light', true);
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('uses dark for missing, removed, or invalid settings', () => {
    for (const value of [undefined, null, 'system', 'LIGHT', {}, false]) {
      expect(normalizeTheme(value)).toBe('dark');
    }
    expect(normalizeTheme('light')).toBe('light');
    dispose = initializeTheme();
    receive(undefined, false);
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('cleans up a subscription that completes after disposal', async () => {
    dispose = initializeTheme();
    dispose();
    await Promise.resolve();
    expect(unlisten).toHaveBeenCalledOnce();
    receive('dark', false);
    useSettings.setState({ theme: 'dark' });
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('exposes a named native-button switch in Preferences and reflects remote changes', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    dispose = initializeTheme();
    try {
      await act(async () => root.render(createElement(Preferences)));
      const toggle = container.querySelector<HTMLButtonElement>(
        'button[role="switch"][name="theme"]'
      )!;
      expect(toggle).not.toBeNull();
      expect(toggle.type).toBe('button');
      expect(toggle.getAttribute('aria-labelledby')).toBe('dark-mode-label');
      expect(toggle.getAttribute('aria-checked')).toBe('false');

      await act(async () => toggle.click());
      expect(toggle.getAttribute('aria-checked')).toBe('true');
      expect(setSetting).toHaveBeenCalledWith('theme', 'dark');

      await act(async () => receive('light', false));
      expect(toggle.getAttribute('aria-checked')).toBe('false');
    } finally {
      await act(async () => root.unmount());
      container.remove();
    }
  });
});
