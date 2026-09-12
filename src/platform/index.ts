/**
 * The only place in the frontend that imports `@tauri-apps/*`.
 *
 * Everything the UI needs from the shell goes through here, which is what makes
 * the React code portable and kept the Electron → Tauri swap to a handful of
 * call-site changes.
 */
export { bootSettings, appVersion, isMac, isWin } from './env';
export { setSetting } from './settings';
export { resizeWindow, hideWindow, openDevtools } from './window';
export { setGlobalShortcut, restoreSettings, setAutostart } from './shortcut';
export { openExternal } from './opener';
export { batchexecute } from './translate';
