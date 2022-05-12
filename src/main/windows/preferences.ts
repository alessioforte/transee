import { BrowserWindow } from 'electron';
import theme from '../../renderer/theme';
import { webPreferences, indexPath } from '../config'

let preferencesWin: Electron.BrowserWindow | null;

const createPreferencesWindow = () => {
  if (!preferencesWin) {
    const preferencesConfig: Electron.BrowserWindowConstructorOptions = {
      width: 420,
      height: 430,
      backgroundColor: theme.colors.background,
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
  }
  return preferencesWin
};

export default createPreferencesWindow
