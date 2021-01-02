import { useCallback } from 'react';
import { ipcRenderer } from 'electron';
import { invertLangs } from '../containers/LangsBar/actions';

const useWindowKeyDown = ({ store, actions }) => {
  const {
    suggestions,
    google,
    search,
    engine,
    reverso,
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

      // alt shify - invert langs
      if (e.altKey && e.key === 'Shift') {
        const langs = invertLangs(store.langs);
        setLangs(langs);

        // TODO: handle masculine and feminine case
        const translation = store[engine].translation;
        console.log('translation', translation);
        // if (translation) {
        //   setInput(translation);
        //   getData(translation, langs.selected);
        // }
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
        let translation = store[engine] ? store[engine].translation : '';
        if (engine === 'google' && !google) {
          translation = store.reverso ? store.reverso.translation : '';
        }
        if (engine === 'reverso' && !reverso) {
          translation = store.google ? store.google.translation : '';
        }
        if (translation) {
          playAudio(translation, langs.selected.to, 'to', speed);
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
