import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import { invoke, isTauri } from '@tauri-apps/api/core';
import type { Theme } from '@/types/theme';

/** Width of the translation bar, as hardcoded by the Electron main process. */
const BAR_WIDTH = 680;

/**
 * Replaces the `window-height` IPC channel. The height comes from the renderer
 * measuring `#root.scrollHeight`; the width is fixed, exactly as
 * `mainWindow.setSize(680, height)` did.
 */
export function resizeWindow(height: number): void {
  void getCurrentWindow()
    .setSize(new LogicalSize(BAR_WIDTH, height))
    .catch((err) => console.error('[transee] resize failed', err));
}

/** Replaces the `hide-window` IPC channel. */
export function hideWindow(): void {
  void getCurrentWindow().hide();
}

/** Replaces the `devtools` IPC channel. No-op in release builds. */
export function openDevtools(): void {
  void invoke('open_devtools');
}

/** Match native title bars and opaque window backgrounds to the UI palette. */
export function setWindowTheme(theme: Theme): void {
  if (!isTauri()) return;
  const window = getCurrentWindow();
  void window
    .setTheme(theme)
    .catch((err) => console.error('[transee] window theme failed', err));
  // The resident bar must retain its transparent corners.
  if (window.label !== 'main') {
    void window
      .setBackgroundColor(theme === 'light' ? '#f7f8fa' : '#2a2a2a')
      .catch((err) => console.error('[transee] window background failed', err));
  }
}
