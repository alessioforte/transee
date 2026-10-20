/**
 * The only place in the frontend that imports `@tauri-apps/*`.
 *
 * Everything the UI needs from the shell goes through here, which is what makes
 * the React code portable and kept the Electron → Tauri swap to a handful of
 * call-site changes.
 */
export { bootSettings, appVersion, isMac, isWin, platform } from './env';
export { setSetting, watchSetting } from './settings';
export { resizeWindow, hideWindow, openDevtools, setWindowTheme } from './window';
export { setGlobalShortcut, restoreSettings, setAutostart } from './shortcut';
export { openExternal } from './opener';
export { batchexecute, googleDictionary } from './translate';
