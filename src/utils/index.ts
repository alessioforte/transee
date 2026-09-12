import { resizeWindow } from '@/platform';

export const setMainWindowSize = (): void => {
  const root: HTMLElement | null = document.getElementById('root');
  if (root) {
    let height = root.scrollHeight;
    if (height < 81) height = 81;
    resizeWindow(height);
  }
};

// Platform detection now comes from the Rust side via the bootstrap script.
// `navigator.platform` returned 'MacIntel'/'Win32' under Electron's Chromium
// but misreports under WKWebView and WebView2.
export { isMac, isWin } from '@/platform';

export const validateInput = (text: string) => {
  const isUppercase = /[A-Z]/.test(text);
  const hasDoubleSpace = /\s\s+/.test(text);
  const hasSpaceAtFirst = text && text.charAt(0) === ' ';
  const isNewLine = /\n/g.test(text);
  return !(!text || isUppercase || hasDoubleSpace || hasSpaceAtFirst || isNewLine)
}

export const SEARCHBAR_ID = 'searchbar'

export const forceFocusOnInput = () => {
  const input = document.getElementById(SEARCHBAR_ID)
  if (input?.focus) {
    input.focus()
  }
}
