import { ipcRenderer } from 'electron';

export const setMainWindowSize = (): void => {
  const root: HTMLElement | null = document.getElementById('root');
  if (root) {
    let height = root.scrollHeight;
    if (height < 81) height = 81;
    ipcRenderer.send('window-height', height);
  }
};

window.onkeydown = (e: KeyboardEvent) => {
  // esc
  if (e.keyCode === 27) {
    e.preventDefault();
    // ipcRenderer.send('hide-window', 'hide');
  }

  // alt shify
  if (e.altKey && e.keyCode === 16) {
    // invertLanguages();
  }

  // ctrl p - voice
  if (e.ctrlKey && !e.altKey && e.keyCode === 80) {
    e.preventDefault();
    // let text = store.getState().text;
    // if (text !== '') {
    //   let from = store.getState().langs.from;
    //   let speed = store.getState().speed.from;
    //   playAudio(text, from, speed);
    //   store.dispatch(speedFrom(!speed));
    // }
  }

  // ctrl alt p - voice
  if (e.ctrlKey && e.altKey && e.keyCode === 80) {
    e.preventDefault();
    // let data = store.getState().translate.data;

    // if (data) {
    //   let text = data.translation;
    //   let to = store.getState().langs.to;
    //   let speed = store.getState().speed.to;

    //   playAudio(text, to, speed);
    //   store.dispatch(speedTo(!speed));
    // }
  }

  if (e.shiftKey && e.ctrlKey && e.altKey && e.keyCode === 8) {
    ipcRenderer.send('devtools', null);
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
