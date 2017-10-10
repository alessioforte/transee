const { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut } = require('electron')
const electron = require('electron')
const path = require('path')
const events = require('events')
const settings = require('electron-settings')
const updater = require('./updater')

const indexPath = `file://${__dirname}/../renderer/index.html`
const preferencesPath = `file://${__dirname}/../renderer/preferences.html`
const aboutPath = `file://${__dirname}/../renderer/about.html#v${app.getVersion()}`
const iconPath = path.join(__dirname, '../assets', 'iconTemplate.png')

var win, aboutWin, tray, preferencesWin
var windowPosition = (process.platform === 'win32') ? 'trayBottomCenter' : 'trayCenter'
var globalY

app.on('ready', appReady)

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('before-quit', () => {
  if (win) {
    win.webContents.send('settings', 'save')
  }
})

function appReady() {
  app.dock.hide()

  let check = app.getLoginItemSettings().openAtLogin
  settings.set('start-login', check)

  let screen = electron.screen
  let screenHeight = screen.getPrimaryDisplay().size.height
  globalY = screenHeight > 800 ? 160 : 80

  tray = new Tray(iconPath)

  const contextMenu = Menu.buildFromTemplate([
    { label: 'About Transee', click: () => showAboutWindow() },
    { label: 'Check for update', click: () => updater.checkForUpdates(true) },
    { type: 'separator' },
    { label: 'Preferences...', click: () => showPreferencesWindow() },
    { type: 'separator' },
    { label: 'Show', accelerator: 'Control+T', click: () => showWindow() },
    { label: 'Hide', accelerator: 'esc', click: () => hideWindow() },
    { type: 'separator' },
    { label: 'Quit', accelerator: 'Command+Q', click: () => app.quit() }
  ])

  tray.setContextMenu(contextMenu)

  createWindow()

  const ret = globalShortcut.register('Control+T', () => {
    showWindow()
  })

  updater.checkForUpdates()
}

const createWindow = () => {
  win = new BrowserWindow({
    width: 680,
    height: 85,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    // vibrancy: 'ultra-dark',
    webPreferences: {
      backgroundThrottling: false,
      devTools: false
    }
  })

  win.on('blur', () => {
    hideWindow()
  })

  win.setVisibleOnAllWorkspaces(true)
  win.loadURL(indexPath)
  win.on('close', clearWindow)

  const template = [
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'pasteandmatchstyle'},
        {role: 'delete'},
        {role: 'selectall'}
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

const createAboutWindow = () => {
  aboutWin = new BrowserWindow({
    width: 520,
    height: 250,
    titleBarStyle: 'hidden',
    // vibrancy: 'dark',
    minimizable: false,
    maximizable: false,
    resizable: false,
    webPreferences: {
      devTools: false
    }
  })

  aboutWin.loadURL(aboutPath)
  aboutWin.on('close', clearAboutWindow)
  aboutWin.show()
}

const createPreferencesWindow = () => {
  preferencesWin = new BrowserWindow({
    width: 300,
    height: 200,
    titleBarStyle: 'hidden',
    minimizable: false,
    maximizable: false,
    resizable: false,
    // vibrancy: 'ultra-dark'
  })

  preferencesWin.loadURL(preferencesPath)
  preferencesWin.on('close', () => {
    preferencesWin = null
  })
}

function showWindow() {
  if (!win) {
    createWindow()
  }

  var { x, y } = getWindowPosition()
  win.setPosition(x, y)
  win.show()

  return
}

function hideWindow() {
  if (!win) return
  win.hide()
}

function clearWindow() {
  win = null
}

function getWindowPosition() {
  let screen = electron.screen
  let point = screen.getCursorScreenPoint()
  let displayBounds = screen.getDisplayNearestPoint(point).bounds
  let windowBounds = win.getBounds()

  const x = Math.round(displayBounds.x + (displayBounds.width - windowBounds.width) / 2)
  const y = globalY

  return {x, y}
}

function clearAboutWindow() {
  aboutWin = null
}

function showAboutWindow() {
  if (!aboutWin) {
    createAboutWindow()
  }
}

function showPreferencesWindow() {
  if (!preferencesWin) {
    createPreferencesWindow()
  }
}

ipcMain.on('window-height', (event, height) => {
  win.setSize(680, height)
  event.returnValue = true
})

ipcMain.on('hide-window', (event, msg) => {
  hideWindow()
})

ipcMain.on('set-start-login', (event, check) => {
  app.setLoginItemSettings({
    openAtLogin: check,
    openAsHidden: check
  })
})
