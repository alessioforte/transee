import { app } from 'electron';
import * as path from 'path';
import { Tray, Menu } from 'electron';
import createAboutWindow from './windows/about';
import createPreferencesWindow from './windows/preferences';
import createWelcomeWindow from './windows/welcome';
import { showWindow } from './windows/bar';
import updater from './updater';
import store from './store';

let accelerator: string = store.has('shortcut') ? (store.get('shortcut') as string) : 'Ctrl+Alt+T';

const createTray = () => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');
  const file = process.platform === 'win32' ? 'icon_16x16.ico' : 'iconTemplate.png';
  const iconPath = path.resolve(RESOURCES_PATH, file)

  let tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'About Transee', click: createAboutWindow },
    { label: 'Check for update', click: () => updater.checkForUpdates() },
    { type: 'separator' },
    { label: 'Preferences...', click: createPreferencesWindow },
    { type: 'separator' },
    {
      label: 'Show translation bar',
      accelerator,
      click: showWindow,
    },
    { type: 'separator' },
    { label: 'Welcome Guide', click: createWelcomeWindow },
    { type: 'separator' },
    { label: 'Quit', accelerator: 'Command+Q', click: app.quit },
  ]);

  tray.setContextMenu(contextMenu);

  return tray
}

export default createTray