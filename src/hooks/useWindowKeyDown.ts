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
  const { setLangs, getData, setSuggestions, playAudio } = actions;

  window.onkeydown = useCallback(
    (e: KeyboardEvent) => {
      // esc
      if (e.keyCode === 27) {
        e.preventDefault();

        if (suggestions.length > 0) {
          e.stopPropagation();
          setSuggestions([]);
        } else {
          ipcRenderer.send('hide-window', 'hide');
        }
      }

      // alt shify
      if (e.altKey && e.keyCode === 16) {
        const langs = invertLangs(store.langs);
        setLangs(langs);
        const translation = google.translation;
        if (translation) {
          getData(translation, langs.selected);
        }
      }

      // ctrl p - voice
      if (e.ctrlKey && !e.altKey && e.keyCode === 80) {
        e.preventDefault();
        if (search) {
          playAudio(search, langs.selected.from, 'from', speed);
        }
      }

      // ctrl alt p - voice
      if (e.ctrlKey && e.altKey && e.keyCode === 80) {
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

      if (e.shiftKey && e.ctrlKey && e.altKey && e.keyCode === 8) {
        ipcRenderer.send('devtools', null);
      }
    },
    [store]
  );
};

export default useWindowKeyDown;
