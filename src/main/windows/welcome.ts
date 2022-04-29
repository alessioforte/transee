import { app, BrowserWindow } from 'electron';
import theme from '../../renderer/theme';
import { webPreferences, indexPath } from '../config'

let welcomeWin: Electron.BrowserWindow | null;

const createWelcomeWindow = () => {
  if (!welcomeWin) {
    const welcomeConfig: Electron.BrowserWindowConstructorOptions = {
      width: 520,
      height: 430,
      titleBarStyle: 'hidden',
      backgroundColor: theme.colors.background,
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
  }
  return welcomeWin
};

export default createWelcomeWindow
