import 'dotenv/config';
import {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  globalShortcut,
  Tray,
  Menu,
} from 'electron';
import * as path from 'path';
import Settings from '../settings';
import theme from '../src/theme';
import updater from './updater';

const backgroundColor = theme.colors.background;
const isDev = process.env.NODE_ENV === 'development';

let mainWindow: Electron.BrowserWindow | null;
let aboutWin: Electron.BrowserWindow | null;
let preferencesWin: Electron.BrowserWindow | null;
let welcomeWin: Electron.BrowserWindow | null;
let tray: Tray | null | undefined;
let accelerator: string | null | undefined;

const webPreferences = {
  nodeIntegration: true,
  webSecurity: false,
  enableRemoteModule: true,
};

const winConfig: Electron.BrowserWindowConstructorOptions = {
  width: 680,
  height: 85,
  frame: false,
  fullscreenable: false,
  resizable: false,
  backgroundColor: backgroundColor,
  useContentSize: true,
  show: isDev,
  webPreferences,
};

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => showWindow());
}

const appVersion = app.getVersion();

const indexPath = isDev
  ? 'http://localhost:4000'
  : `file://${path.join(__dirname, 'renderer/index.html')}`;

const iconPath =
  process.platform === 'win32'
    ? path.join(__dirname, '../assets', 'icon_16x16.ico')
    : path.join(__dirname, '../assets', 'iconTemplate.png');

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

app.on('ready', appReady);

app.allowRendererProcessReuse = true;

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

process.on('uncaughtException', () => {
  console.log('uncaughtException');
});

// Init ------------------------------------------------------------------------
async function appReady() {
  // HANDLE APP VERSION
  const versionInSettings = Settings.get('version');
  if (appVersion !== versionInSettings) {
    Settings.delete();
    Settings.set('version', appVersion);
  }

  if (isDev) {
    createWindow();
    createAboutWindow();
    createWelcomeWindow();
    createPreferencesWindow();
  } else {
    //  SET START AT LOGIN
    const check = app.getLoginItemSettings().openAtLogin;
    Settings.set('startAtLogin', check);

    // SET GLOBAL SHORTCUT
    if (Settings.has('shortcut')) {
      accelerator = Settings.get('shortcut');
    } else {
      accelerator = 'Ctrl+Alt+T';
      Settings.set('shortcut', accelerator);
    }
    if (accelerator) {
      globalShortcut.register(accelerator, showWindow);
    }

    // CREATE TRAY AND CONTEXT MENU
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      { label: 'About Transee', click: showAboutWindow },
      { label: 'Check for update', click: () => updater.checkForUpdates() },
      { type: 'separator' },
      { label: 'Preferences...', click: showPreferencesWindow },
      { type: 'separator' },
      {
        label: 'Show translation bar',
        accelerator: accelerator,
        click: showWindow,
      },
      { type: 'separator' },
      { label: 'Welcome Guide', click: showWelcomeWindow },
      { type: 'separator' },
      { label: 'Quit', accelerator: 'Command+Q', click: app.quit },
    ]);

    tray.setContextMenu(contextMenu);

    // AUTOMATICALLY UPDATES
    const checkAutomaticallyUpdates = Settings.has('checkUpdates')
      ? Settings.get('checkUpdates')
      : true;
    if (checkAutomaticallyUpdates) {
      setTimeout(() => updater.checkForUpdates(false), 1000 * 60 * 3);
    }

    // SHOW WELCOME GUIDE
    const showWelcome = Settings.has('showWelcome')
      ? Settings.get('showWelcome')
      : true;
    if (showWelcome) createWelcomeWindow();

    Settings.set('platform', process.platform);
    // CREATE TRANSEE WINDOW IN BACKGROUND
    createWindow();

    // HIDE DOCK ICON IN MACOS
    if (process.platform === 'darwin' && !showWelcome) app.dock.hide();
  }
}

// Create Windows --------------------------------------------------------------
function createWindow() {
  mainWindow = new BrowserWindow(winConfig);
  mainWindow.loadURL(`${indexPath}?main`);
  mainWindow.visibleOnAllWorkspaces = true;
  mainWindow.on('blur', () => {
    if (!isDev) hideWindow();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}
// -----------------------------------------------------------------------------
const createAboutWindow = () => {
  const aboutConfg: Electron.BrowserWindowConstructorOptions = {
    width: 520,
    height: 253,
    backgroundColor: backgroundColor,
    titleBarStyle: 'hidden',
    minimizable: false,
    maximizable: false,
    resizable: false,
    webPreferences,
  };
  aboutWin = new BrowserWindow(aboutConfg);

  aboutWin.loadURL(`${indexPath}?about`);

  aboutWin.on('close', () => {
    aboutWin = null;
  });
};

// -----------------------------------------------------------------------------
const createPreferencesWindow = () => {
  const preferencesConfig: Electron.BrowserWindowConstructorOptions = {
    width: 420,
    height: 430,
    backgroundColor: backgroundColor,
    titleBarStyle: 'hidden',
    minimizable: false,
    maximizable: false,
    resizable: false,
    webPreferences,
  };
  preferencesWin = new BrowserWindow(preferencesConfig);

  preferencesWin.loadURL(`${indexPath}?preferences`);

  preferencesWin.on('close', () => {
    preferencesWin = null;
  });
};

// -----------------------------------------------------------------------------
const createWelcomeWindow = () => {
  const welcomeConfig: Electron.BrowserWindowConstructorOptions = {
    width: 520,
    height: 430,
    titleBarStyle: 'hidden',
    backgroundColor: backgroundColor,
    minimizable: false,
    maximizable: false,
    resizable: false,
    webPreferences,
  };

  welcomeWin = new BrowserWindow(welcomeConfig);

  welcomeWin.loadURL(`${indexPath}?welcome`);

  welcomeWin.on('close', () => {
    welcomeWin = null;
    app.dock.hide();
  });
};

// -----------------------------------------------------------------------------
function hideWindow() {
  if (mainWindow) {
    mainWindow.hide();
  }
}

function showWindow() {
  if (!mainWindow) {
    createWindow();
  }

  const { x, y } = getWindowPosition();
  mainWindow.setPosition(x, y);
  mainWindow.show();
}

function getWindowPosition() {
  const point = screen.getCursorScreenPoint();
  const displayBounds = screen.getDisplayNearestPoint(point).bounds;
  const windowBounds = mainWindow.getBounds();
  let maxAppHeight = 800;
  if (displayBounds.height < 768) maxAppHeight = 768;

  const x = Math.round(
    displayBounds.x + (displayBounds.width - windowBounds.width) / 2
  );
  const y = (displayBounds.height - maxAppHeight) / 2 + displayBounds.y;

  return { x, y };
}

function showAboutWindow() {
  if (!aboutWin) {
    createAboutWindow();
  }
}

function showWelcomeWindow() {
  if (!welcomeWin) {
    createWelcomeWindow();
  }
}

function showPreferencesWindow() {
  if (!preferencesWin) {
    createPreferencesWindow();
  }
}

// IPC -------------------------------------------------------------------------
ipcMain.on('window-height', (event, height) => {
  if (mainWindow) {
    mainWindow.setSize(680, height);
    event.returnValue = true;
  }
});

ipcMain.on('hide-window', (event, msg) => {
  hideWindow();
});

ipcMain.on('set-start-login', (event, check) => {
  app.setLoginItemSettings({
    openAtLogin: check,
  });
});

ipcMain.on('change-shortcut', (event, shortcut) => {
  globalShortcut.unregisterAll();
  globalShortcut.register(shortcut, () => {
    showWindow();
  });
});

ipcMain.on('devtools', (event) => {
  mainWindow.webContents.openDevTools();
});

ipcMain.on('restore-settings', (event, msg) => {
  const check = app.getLoginItemSettings().openAtLogin;
  Settings.set('version', appVersion);
  Settings.set('show-welcome', true);
  Settings.set('start-login', check);
  Settings.set('shortcut', 'Ctrl+Alt+T');
  app.relaunch();
  app.exit(0);
});
