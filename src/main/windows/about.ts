import { BrowserWindow } from 'electron';
import theme from '../../renderer/theme';
import { webPreferences, indexPath } from '../config'

let aboutWin: Electron.BrowserWindow | null;

const createAboutWindow = () => {
  if (!aboutWin) {
    const aboutConfg: Electron.BrowserWindowConstructorOptions = {
      width: 520,
      height: 253,
      backgroundColor: theme.colors.background,
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
  }

  return aboutWin
};

export default createAboutWindow