import { invoke } from '@tauri-apps/api/core';
import { enable, disable } from '@tauri-apps/plugin-autostart';

/**
 * Replaces the `change-shortcut` IPC channel. Rust owns registration, so no
 * global-shortcut capability is needed in the webview.
 *
 * Unlike Electron's `globalShortcut.register`, whose boolean return the old
 * main process ignored, a clash or a malformed accelerator rejects here.
 */
export function setGlobalShortcut(accelerator: string): Promise<void> {
  return invoke('set_shortcut', { accelerator });
}

/** Replaces the `restore-settings` IPC channel. Restarts the app. */
export function restoreSettings(): Promise<void> {
  return invoke('restore_settings');
}

/**
 * Replaces the `set-start-login` IPC channel.
 *
 * NOTE: this writes `~/Library/LaunchAgents/<id>.plist`, which macOS surfaces
 * under Settings → General → Login Items → "Allow in the Background", not the
 * "Open at Login" list where Electron's `setLoginItemSettings` put it.
 */
export async function setAutostart(enabled: boolean): Promise<void> {
  try {
    await (enabled ? enable() : disable());
  } catch (err) {
    console.error('[transee] failed to change autostart', err);
  }
}
