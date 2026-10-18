import { openUrl } from '@tauri-apps/plugin-opener';

/** Replaces the `open-external` IPC channel. */
export function openExternal(url: string): void {
  void openUrl(url).catch((err) => console.error('[transee] failed to open', url, err));
}
