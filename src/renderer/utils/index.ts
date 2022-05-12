
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

export const validateInput = (text: string) => {
  const isUppercase = /[A-Z]/.test(text);
  const hasDoubleSpace = /\s\s+/.test(text);
  const hasSpaceAtFirst = text && text.charAt(0) === ' ';
  const isNewLine = /\n/g.test(text);
  return !(!text || isUppercase || hasDoubleSpace || hasSpaceAtFirst || isNewLine)
}