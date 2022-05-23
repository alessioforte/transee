import { app, BrowserWindow } from 'electron';
import theme from '../../renderer/theme';
import { webPreferences, indexPath } from '../config'

let welcomeWin: Electron.BrowserWindow | null;

const createWelcomeWindow = () => {
  if (!welcomeWin) {
    const welcomeConfig: Electron.BrowserWindowConstructorOptions = {
      width: 520,
      height: 430,
      backgroundColor: theme.colors.background,
      titleBarStyle: process.platform == 'win32' ? 'hiddenInset' : 'hidden',
      minimizable: false,
      maximizable: false,
      resizable: false,
      webPreferences,
    };
  
    welcomeWin = new BrowserWindow(welcomeConfig);
    welcomeWin.menuBarVisible = false;
    welcomeWin.loadURL(`${indexPath}?welcome`);
  
    welcomeWin.on('close', () => {
      welcomeWin = null;
      if (process.platform === 'darwin') {
        app.dock.hide();
      }
    });
  }
  return welcomeWin
};

export default createWelcomeWindow
