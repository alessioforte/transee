import { app, BrowserWindow, screen, ipcMain, Menu, Tray, nativeImage } from 'electron'
const path = require('path')
const settings = require('electron-settings')

const indexPath = `file://${process.cwd()}/app/renderer/index.html`
const preferencesPath = `file://${process.cwd()}/app/renderer/preferences.html`

let win = null
let tray = null
let preferencesWin = null

const createWindow = () => {
  var screenWidth = screen.getPrimaryDisplay().size.width

  win = new BrowserWindow({
    frame: false,
    width: 680,
    height: 85,
    y: 100,
    x: 60,
    fullscreenable: false,
    resizable: false,
    vibrancy: 'ultra-dark',
  });

  win.loadURL(indexPath);

  win.webContents.openDevTools();

  win.on('closed', function () {
    win = null;
  });
}

const createPreferencesWindow = () => {
  preferencesWin = new BrowserWindow({
    x: 60,
    y: 300,
    width: 300,
    height: 200,
    titleBarStyle: 'hidden',
    minimizable: false,
    maximizable: false,
    resizable: false,
    vibrancy: 'ultra-dark'
  })

  preferencesWin.loadURL(preferencesPath)
  preferencesWin.on('closed', () => {
    preferencesWin = null
  })
}

app.on('ready', () => {
  let check = app.getLoginItemSettings().openAtLogin
  console.log('start at login:', check)
  settings.set('start-login', check)
  createWindow()
  createPreferencesWindow()
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
  // win.webContents.send('settings', 'save')
})

app.on('activate', function () {
    if (win === null) {
        createWindow();
    }
});

ipcMain.on('window-height', (event, height) => {
  win.setSize(680, height)
  event.returnValue = true
})

ipcMain.on('hide-window', (event, msg) => {
  console.log(msg)
})

ipcMain.on('set-start-login', (event, check) => {
  app.setLoginItemSettings({
    openAtLogin: check,
    openAsHidden: check
  })
})
