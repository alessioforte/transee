const { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, dialog } = require('electron')
const electron = require('electron')
const path = require('path')
const events = require('events')
const settings = require('electron-settings')
const updater = require('./updater')

const indexPath = `file://${__dirname}/../renderer/index.html`
const preferencesPath = `file://${__dirname}/../renderer/preferences.html`
const aboutPath = `file://${__dirname}/../renderer/about.html#v${app.getVersion()}`
const welcomePath = `file://${__dirname}/../renderer/welcome.html`
const iconPath = process.platform === 'win32' ?
  path.join(__dirname, '../assets', 'icon_16x16.ico') :
  path.join(__dirname, '../assets', 'iconTemplate.png')

var win, aboutWin, tray, preferencesWin, welcomeWin
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

process.on('uncaughtException', () => {
  console.log('uncaughtException')
})

function appReady() {
  if (process.platform === 'darwin') app.dock.hide()

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
    { label: 'Welcome Guide', click: () => showWelcomeWindow()},
    { type: 'separator' },
    { label: 'Quit', accelerator: 'Command+Q', click: () => app.quit() }
  ])

  tray.setContextMenu(contextMenu)

  createWindow()

  // SHOW WELCOME GUIDE
  let showWelcome = settings.has('show-welcome') ? settings.get('show-welcome') : true
  if (showWelcome) createWelcomeWindow()

  // SET GLOBAL SHORTCUT
  const ret = globalShortcut.register('Control+T', () => { showWindow() })

  let checkAutomaticallyUpdates = settings.has('check-automatically-updates') ?
    settings.get('check-automatically-updates') : true

  if (checkAutomaticallyUpdates) {
    setTimeout(() => updater.checkForUpdates(), 1000 * 60 * 3)
  }
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

  win.webContents.on('crashed', () => {
    console.log('crashed')

    dialog.showMessageBox({
      type: 'info',
      message: 'Crash Error!',
      detail: 'I\'m so sorry... restart Transee!',
    })
    app.relaunch()
  })

  win.on('unresponsive', () => {
    console.log('unresponsive')
  })

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
    webPreferences: {
      devTools: false
    }
  })

  preferencesWin.loadURL(preferencesPath)
  preferencesWin.on('close', () => {
    preferencesWin = null
  })
}

const createWelcomeWindow = () => {
  welcomeWin = new BrowserWindow({
    width: 520,
    height: 320,
    titleBarStyle: 'hidden',
    minimizable: false,
    maximizable: false,
    resizable: false,
    webPreferences: {
      devTools: false
    }
  })

  welcomeWin.loadURL(welcomePath)
  welcomeWin.on('closed', () => {
    welcomeWin = null
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

function showWelcomeWindow() {
  if (!welcomeWin) {
    createWelcomeWindow()
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
