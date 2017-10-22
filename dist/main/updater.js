const { app, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')

const internetAvailable = require('internet-available')

autoUpdater.autoDownload = false
var manualCheck = false
var version = app.getVersion()

autoUpdater.on('error', (event, error) => {
  dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
})

autoUpdater.on('checking-for-update', () => { })

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    message: 'Found Updates',
    detail: 'New version is available, do you want update now?',
    buttons: ['Sure', 'No']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      autoUpdater.downloadUpdate()
    }
  })
})

autoUpdater.on('update-not-available', () => {
  if (manualCheck) {
    dialog.showMessageBox({
      type: 'info',
      message: 'No Updates',
      detail: `Version ${version} is the latest release.`
    })
  }
})

autoUpdater.on('download-progress', () => { })

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    message: 'Install Updates',
    detail: 'Updates downloaded, application will be quit for update...'
  }, () => {
    setImmediate(() => autoUpdater.quitAndInstall())
  })
})

module.exports = {
  checkForUpdates: (isManual) => {
    if (isManual) manualCheck = true

    internetAvailable().then(() => {
      autoUpdater.checkForUpdates()
    }).catch(() => {
      console.log('internet disconnected')
      if (manualCheck) {
        dialog.showMessageBox({
          type: 'info',
          message: 'Error',
          detail: 'I can\'t check for updates, internet disconnected.'
        })
      }
    })
  }
}
