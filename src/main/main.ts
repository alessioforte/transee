import { app, ipcMain, globalShortcut, shell } from 'electron';
import updater from './updater';
import axios from 'axios';
import { isDev, appVersion } from './config';
import createAboutWindow from './windows/about';
import createPreferencesWindow from './windows/preferences';
import createWelcomeWindow from './windows/welcome';
import createWindow, {
  hideWindow,
  showWindow,
  onSetWindowSizeEvent,
  onOpenDevToolsEvent,
} from './windows/bar';
import store from './store';
import createTray from './menu';

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => showWindow());
}

app.on('ready', appReady);
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Init ------------------------------------------------------------------------
async function appReady() {
  if (isDev) {
    createTray();
    createWindow();
    createAboutWindow();
    createWelcomeWindow();
    createPreferencesWindow();
  } else {
    store.set('platform', process.platform);

    // HANDLE APP VERSION
    const versionInSettings = store.get('version');
    if (appVersion !== versionInSettings) {
      store.clear();
      store.set('version', appVersion);
    }

    //  SET START AT LOGIN
    const check = app.getLoginItemSettings().openAtLogin;
    store.set('startAtLogin', check);

    // SET GLOBAL SHORTCUT
    const accelerator: string =  store.has('shortcut') ? (store.get('shortcut') as string) : 'Ctrl+Alt+T';
    store.set('shortcut', accelerator);
    globalShortcut.register(accelerator, showWindow);

    // CREATE TRAY AND CONTEXT MENU
    createTray();

    // AUTOMATICALLY UPDATES
    const checkAutomaticallyUpdates = store.has('checkUpdates') ? store.get('checkUpdates') : true;
    if (checkAutomaticallyUpdates) {
      setTimeout(() => updater.checkForUpdates(false), 1000 * 60 * 3);
    }

    // CREATE TRANSEE WINDOW IN BACKGROUND
    createWindow();

    // SHOW WELCOME GUIDE
    const showWelcome = store.has('showWelcome') ? store.get('showWelcome') : true;
    if (showWelcome) {
      createWelcomeWindow();
    }

    // HIDE DOCK ICON IN MACOS
    if (process.platform === 'darwin' && !showWelcome) {
      app.dock.hide();
    }
  }
}

/**
 * IPC listeners
 */
ipcMain.on('window-height', onSetWindowSizeEvent);
ipcMain.on('hide-window', hideWindow);
ipcMain.on('devtools', onOpenDevToolsEvent);

ipcMain.on('set-start-login', (_event, openAtLogin) => {
  app.setLoginItemSettings({ openAtLogin });
});

ipcMain.on('change-shortcut', (_event, shortcut) => {
  globalShortcut.unregisterAll();
  globalShortcut.register(shortcut, () => {
    showWindow();
  });
});

ipcMain.on('restore-settings', () => {
  const check = app.getLoginItemSettings().openAtLogin;
  store.set('version', appVersion);
  store.set('showWelcome', true);
  store.set('startAtLogin', check);
  store.set('shortcut', 'Ctrl+Alt+T');
  app.relaunch();
  // TODO verify
});

ipcMain.on('store-get', async (event, key) => {
  event.returnValue = key ? store.get(key) : store.store;
});

ipcMain.on('store-set', async (_event, key, val) => {
  store.set(key, val);
});

ipcMain.on('store-clear', async () => {
  store.clear();
});

ipcMain.on('request', async (event, options, operation) => {
  try {
    const { data } = await axios(options);
    event.reply('response', data, operation);
  } catch (err) {
    event.reply('error', err, operation);
  }
});

ipcMain.on('open-external', () => {
  shell.openExternal('https://alessioforte.github.io/transee/');
});
