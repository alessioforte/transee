const { dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')

autoUpdater.autoDownload = false
var manualCheck = false

autoUpdater.on('error', (event, error) => {
  dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
})

autoUpdater.on('checking-for-update', () => { })

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Found Updates',
    message: 'New version is available, do you want update now?',
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
      title: 'No Updates',
      message: 'Great! Current version is up-to-date!'
    })
  }
})

autoUpdater.on('download-progress', () => { })

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Install Updates',
    message: 'Updates downloaded, application will be quit for update...'
  }, () => {
    setImmediate(() => autoUpdater.quitAndInstall())
  })
})

module.exports = {
  checkForUpdates: (isManual) => {
    if (isManual) manualCheck = true
    autoUpdater.checkForUpdates()
  }
}
