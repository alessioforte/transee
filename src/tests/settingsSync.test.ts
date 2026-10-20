import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = vi.hoisted(() => ({
  get: vi.fn(),
  onKeyChange: vi.fn(),
}));
vi.mock('@tauri-apps/plugin-store', () => ({
  load: vi.fn().mockResolvedValue(store),
}));
vi.mock('@tauri-apps/api/core', () => ({ isTauri: () => true }));

import { watchSetting } from '@/platform/settings';

describe('cross-window settings subscription', () => {
  const unlisten = vi.fn();
  let receive: (value: unknown) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    store.onKeyChange.mockImplementation(async (_key, callback) => {
      receive = callback;
      return unlisten;
    });
  });

  it('reads the latest value after the listener is ready', async () => {
    store.get.mockImplementation(async () => {
      expect(store.onKeyChange).toHaveBeenCalledWith(
        'theme',
        expect.any(Function)
      );
      return 'light';
    });
    const callback = vi.fn();
    const stop = await watchSetting('theme', callback);
    expect(callback).toHaveBeenCalledExactlyOnceWith('light', true);
    receive('dark');
    expect(callback).toHaveBeenLastCalledWith('dark', false);
    stop();
    expect(unlisten).toHaveBeenCalledOnce();
  });

  it('discards a stale read if a change arrives while it is pending', async () => {
    store.get.mockImplementation(async () => {
      receive('light');
      return 'dark';
    });
    const callback = vi.fn();
    await watchSetting('theme', callback);
    expect(callback).toHaveBeenCalledExactlyOnceWith('light', false);
  });

  it('removes the listener if the initial read fails', async () => {
    store.get.mockRejectedValue(new Error('read failed'));
    await expect(watchSetting('theme', vi.fn())).rejects.toThrow('read failed');
    expect(unlisten).toHaveBeenCalledOnce();
  });
});
