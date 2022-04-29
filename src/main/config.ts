import { app } from 'electron';
import * as path from 'path';

export const webPreferences: Electron.WebPreferences = {
  nodeIntegration: true,
  webSecurity: false,
  webviewTag: true,
  preload: app.isPackaged
    ? path.join(__dirname, 'preload.js')
    : path.join(__dirname, '../../.erb/dll/preload.js'),
};


export const isDev = process.env.NODE_ENV === 'development';
export const appVersion = process.env.VERSION;
export const indexPath = isDev
  ? `http://localhost:${process.env.PORT || '1212'}`
  :`file://${path.resolve(__dirname, '../renderer/', 'index.html')}`
