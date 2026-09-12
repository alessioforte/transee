import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';

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
