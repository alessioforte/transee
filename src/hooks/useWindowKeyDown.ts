import { useCallback } from 'react';
import { ipcRenderer } from 'electron';
import { invertLangs } from '../containers/LangsBar/actions';

const useWindowKeyDown = ({ store, actions }): void => {
  const {
    suggestions,
    google,
    search,
    engine,
    // reverso,
    langs,
    speed,
  } = store;
  const { setLangs, getData, setSuggestions, playAudio, setInput } = actions;

  window.onkeydown = useCallback(
    (e: KeyboardEvent) => {
      // esc
      if (e.key === 'Escape') {
        e.preventDefault();

        if (suggestions.length > 0) {
          e.stopPropagation();
          setSuggestions([]);
        } else {
          ipcRenderer.send('hide-window', 'hide');
        }
      }

      // ctrl i - invert langs
      if (e.ctrlKey && e.code === 'KeyI') {
        const newLangs = invertLangs(store.langs);
        setLangs(newLangs);

        if (store.payload) {
          setInput(store.payload);
          getData(store.payload, newLangs.selected);
        }
      }

      // ctrl p - voice
      if (e.ctrlKey && !e.altKey && e.code === 'KeyP') {
        e.preventDefault();
        if (search) {
          playAudio(search, langs.selected.from, 'from', speed);
        }
      }

      // ctrl alt p - voice
      if (e.ctrlKey && e.altKey && e.code === 'KeyP') {
        e.preventDefault();
        let translation = store[engine] ? store[engine].translation : null;
        if (engine === 'google' && !google) {
          translation = store.reverso ? store.reverso.translation : null;
        }
        // if (engine === 'reverso' && !reverso) {
        //   translation = store.google ? store.google.translation : null;
        // }
        if (translation) {
          let voice = '';
          if (translation[0][5] && translation[0][5][0] && translation[0][5][0][0]) {
            voice = translation[0][5][0][0];
          }
          if (translation[0][0]) {
            voice = translation[0][0];
          }
          playAudio(voice, langs.selected.to, 'to', speed);
        }
      }

      if (e.shiftKey && e.ctrlKey && e.altKey && e.key === 'Backspace') {
        ipcRenderer.send('devtools', null);
      }
    },
    [store]
  );
};

export default useWindowKeyDown;
