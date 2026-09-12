import { resizeWindow } from '@/platform';

export const SEARCHBAR_ID = 'searchbar';

/**
 * Measures the rendered document and asks the shell to match it.
 *
 * Under Electron this went over IPC to `mainWindow.setSize(680, h)`; the width
 * and the 81px floor are carried over unchanged.
 */
export const setMainWindowSize = (): void => {
  const root = document.getElementById('root');
  if (!root) return;
  const height = Math.max(root.scrollHeight, 81);
  resizeWindow(height);
};

export const forceFocusOnInput = (): void => {
  document.getElementById(SEARCHBAR_ID)?.focus();
};
