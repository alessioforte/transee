import { ipcRenderer } from 'electron';

export const setMainWindowSize = (): void => {
  const root: HTMLElement | null = document.getElementById('root');
  if (root) {
    let height = root.scrollHeight;
    if (height < 81) height = 81;
    ipcRenderer.send('window-height', height);
  }
};

// window.eval = global.eval = function () {
//   throw new Error(
//     'Sorry, Transee does not support eval() for security reasons.'
//   );
// };

export const isMacPlatform = () => {
  return window.navigator.platform === 'MacIntel';
}

export const isWinPlatform = () => {
  return window.navigator.platform === 'Win32';
}

export const isWin = isWinPlatform();
export const isMac = isMacPlatform();
