
export const setMainWindowSize = (): void => {
  const root: HTMLElement | null = document.getElementById('root');
  if (root) {
    let height = root.scrollHeight;
    if (height < 81) height = 81;
    window.electron.ipcRenderer.send('window-height', height);
  }
};

export const isMacPlatform = () => {
  const platform = window.navigator?.userAgentData?.platform || window.navigator?.platform || 'unknown'
  return platform === 'MacIntel';
}

export const isWinPlatform = () => {
  const platform = window.navigator?.userAgentData?.platform || window.navigator?.platform || 'unknown'
  return platform === 'Win32';
}

export const isWin = isWinPlatform();
export const isMac = isMacPlatform();
