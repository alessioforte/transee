import { screen, BrowserWindow } from 'electron';
import theme from '../../renderer/theme';
import { webPreferences, indexPath, isDev } from '../config'

let mainWindow: Electron.BrowserWindow | null;

export function hideWindow() {
  if (mainWindow) {
    mainWindow.hide();
  }
}

function getWindowPosition() {
  const point = screen.getCursorScreenPoint();
  const displayBounds = screen.getDisplayNearestPoint(point).bounds;
  const windowBounds = mainWindow ? mainWindow.getBounds() : { width: 680, height: 85 };

  let maxAppHeight = 800;
  if (displayBounds.height < 768) {
    maxAppHeight = 768;
  }

  const x = Math.round(displayBounds.x + (displayBounds.width - windowBounds.width) / 2);
  const y = (displayBounds.height - maxAppHeight) / 2 + displayBounds.y;

  return { x, y };
}

export function showWindow() {
  if (!mainWindow) {
    createWindow();
  } else {
    const { x, y } = getWindowPosition();
    mainWindow.setPosition(x, y);
    mainWindow.show();
  }
}

function createWindow() {
  if (!mainWindow) {
    const winConfig: Electron.BrowserWindowConstructorOptions = {
      width: 680,
      height: 85,
      frame: false,
      fullscreenable: false,
      resizable: process.platform !== 'darwin',
      backgroundColor: theme.colors.background,
      useContentSize: true,
      show: isDev,
      webPreferences,
    };
  
    mainWindow = new BrowserWindow(winConfig);
    mainWindow.loadURL(`${indexPath}?main`);
    mainWindow.visibleOnAllWorkspaces = true;
  
    mainWindow.on('blur', () => {
      if (!isDev) {
        hideWindow()
      };
    });
  
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  return mainWindow
}

export function onSetWindowSizeEvent(event: any, height: number) {
  if (mainWindow) {
    mainWindow.setSize(680, height);
    event.returnValue = true;
  }
}

export function onOpenDevToolsEvent() {
  mainWindow?.webContents.openDevTools();
}

export default createWindow
