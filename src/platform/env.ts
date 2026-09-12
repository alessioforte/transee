/**
 * Values injected by the Rust side before any page script runs
 * (`src-tauri/src/windows.rs` → `bootstrap_script`).
 *
 * This exists so the renderer can still read its settings *synchronously* at
 * module load, the way it did through electron-store's `sendSync`.
 * `@tauri-apps/plugin-store` is async-only, and making the bootstrap async
 * would mean touching every window entry point — that is a Phase 2 change.
 */

export type Bootstrap = {
  settings: Record<string, unknown>;
  platform: string;
  version: string;
};

const boot: Bootstrap = window.__TRANSEE__ ?? {
  settings: {},
  platform: 'unknown',
  version: '0.0.0',
};

export const bootSettings = boot.settings;
export const appVersion = boot.version;

/**
 * `std::env::consts::OS` values. Replaces the `navigator.platform` sniffing in
 * the Electron build, which returned 'MacIntel'/'Win32' under Chromium but
 * misreports under WKWebView and WebView2.
 */
export const isMac = boot.platform === 'macos';
export const isWin = boot.platform === 'windows';
