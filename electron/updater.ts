import { app, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import internetAvailable from 'internet-available';

autoUpdater.autoDownload = false;
let manualCheck = false;
const version = app.getVersion();

autoUpdater.on('error', (event, error) => {
  // dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
  dialog.showMessageBox({
    type: 'info',
    message: 'Error',
    detail: "An error has occurred, I can't check for updates!",
  });
});

// autoUpdater.on('checking-for-update', () => {});

autoUpdater.on('update-available', () => {
  dialog.showMessageBox(
    {
      type: 'info',
      message: 'Found Updates',
      detail: 'New version is available, do you want update now?',
      buttons: ['Sure', 'No'],
    },
    (buttonIndex) => {
      if (buttonIndex === 0) {
        autoUpdater.downloadUpdate();
      }
    }
  );
});

autoUpdater.on('update-not-available', () => {
  if (manualCheck) {
    manualCheck = false;

    dialog.showMessageBox({
      type: 'info',
      message: 'No Updates',
      detail: `Version ${version} is the latest release.`,
    });
  }
});

// autoUpdater.on('download-progress', () => {});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(
    {
      type: 'info',
      message: 'Install Updates',
      detail: 'Updates downloaded, application will be quit for update...',
    },
    () => {
      setImmediate(() => autoUpdater.quitAndInstall());
    }
  );
});

const checkForUpdates = (isManual: boolean): void => {
  if (isManual) manualCheck = true;

  internetAvailable()
    .then(() => {
      autoUpdater.checkForUpdates();
    })
    .catch(() => {
      console.log('internet disconnected');
      if (manualCheck) {
        dialog.showMessageBox({
          type: 'info',
          message: 'Error',
          detail: "I can't check for updates, internet disconnected.",
        });
      }
    });
};

const updater = {
  checkForUpdates,
};

export default updater;
