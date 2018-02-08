const { app, BrowserWindow, ipcMain } = require('electron')
const electron = require('electron')
const path = require('path')
const settings = require('electron-settings')

const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS } = require('electron-devtools-installer')

const indexPath = `file://${process.cwd()}/src/renderer/app/index.html`
const preferencesPath = `file://${process.cwd()}/src/renderer/preferences/preferences.html`
const welcomePath = `file://${process.cwd()}/src/renderer/welcome/welcome.html`

let win = null
let tray = null
let preferencesWin = null
let welcomeWin = null

app.on('ready', () => {

  installExtension(REACT_DEVELOPER_TOOLS)
    .then(name => console.log(`Added Extension: ${name}`))
    .catch(err => console.log('An error occurred: ', err))
  installExtension(REDUX_DEVTOOLS)
    .then(name => console.log(`Added Extension: ${name}`))
    .catch(err => console.log('An error occurred: ', err))

  let check = app.getLoginItemSettings().openAtLogin
  console.log('start at login:', check)
  settings.set('start-login', check)
  createWindow()
  // createPreferencesWindow()
  // createWelcomeWindow()

  let checkAutomaticallyUpdates = settings.has('check-automatically-updates') ? settings.get('check-automatically-updates') : true
  if (checkAutomaticallyUpdates) {
    console.log('automatically check updates')
  } else {
    console.log('no check for updates')
  }
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {

})

app.on('activate', function () {
    if (win === null) {
        createWindow();
    }
});

const createWindow = () => {
  var screenWidth = electron.screen.getPrimaryDisplay().size.width

  win = new BrowserWindow({
    frame: false,
    width: 680,
    height: 91,
    y: 100,
    x: 60,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    // vibrancy: 'ultra-dark',
  });

  win.loadURL(indexPath);

  win.webContents.openDevTools();

  win.on('closed', function () {
    win = null;
  });

  win.webContents.on('crashed', () => {
    console.log('crashed')
    app.quit()
  })

  win.on('unresponsive', () => {
    console.log('unresponsive')
  })
}

const createWelcomeWindow = () => {
  welcomeWin = new BrowserWindow({
    x: 60,
    y: 300,
    width: 520,
    height: 430,
    titleBarStyle: 'hidden',
    minimizable: false,
    maximizable: false,
    resizable: false,
  })

  welcomeWin.webContents.openDevTools()

  welcomeWin.loadURL(welcomePath)
  welcomeWin.on('closed', () => {
    welcomeWin = null
  })
}

const createPreferencesWindow = () => {
  preferencesWin = new BrowserWindow({
    x: 60,
    y: 300,
    width: 420,
    height: 430,
    titleBarStyle: 'hidden',
    minimizable: false,
    maximizable: false,
    resizable: false,
  })

  preferencesWin.webContents.openDevTools()
  preferencesWin.loadURL(preferencesPath)
  preferencesWin.on('closed', () => {
    preferencesWin = null
  })
}

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

ipcMain.on('change-shortcut', (event, shortcut) => {
  console.log(shortcut)
})

ipcMain.on('set-transparency', (event, check) => {
  console.log(check)
  win.webContents.send('set-transparency', check)
})

ipcMain.on('restore-settings', (event, msg) => {
  let check = app.getLoginItemSettings().openAtLogin
  settings.set('version', app.getVersion())
  settings.set('show-welcome', true)
  settings.set('start-login', check)
  settings.set('shortcut', 'Ctrl+Alt+T')
  app.relaunch()
  app.exit(0)
})
