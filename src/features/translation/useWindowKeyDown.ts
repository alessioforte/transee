import { useEffect } from 'react';
import { invertLangs } from '@/features/translation/LangsBar/actions';
import { useSettings } from '@/stores/settings';
import { useTranslation } from '@/stores/translation';
import { hideWindow, openDevtools } from '@/platform';

/**
 * Window-level shortcuts for the translation bar.
 *
 * This used to assign `window.onkeydown` during render with no cleanup, wrapped
 * in a `useCallback` keyed on an object that changed identity on every store
 * update — so the memo never hit and anything else assigning `window.onkeydown`
 * would silently win.
 */
const useWindowKeyDown = (): void => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Read straight from the stores so the handler never closes over stale
      // state and does not need re-binding on every keystroke.
      const { langs, setLangs } = useSettings.getState();
      const { suggestions, google, search, payload, setSuggestions, setInput, getData, playAudio } =
        useTranslation.getState();

      if (e.key === 'Escape') {
        e.preventDefault();
        if (suggestions.length > 0) {
          e.stopPropagation();
          setSuggestions([]);
        } else {
          hideWindow();
        }
      }

      // ctrl i — invert languages
      if (e.ctrlKey && e.code === 'KeyI') {
        const newLangs = invertLangs(langs);
        setLangs(newLangs);
        if (payload) {
          setInput(payload);
          getData(payload, newLangs.selected);
        }
      }

      // ctrl p — speak the source text
      if (e.ctrlKey && !e.altKey && e.code === 'KeyP') {
        e.preventDefault();
        if (search) playAudio(search, langs.selected.from, 'from');
      }

      // ctrl alt p — speak the translation
      if (e.ctrlKey && e.altKey && e.code === 'KeyP') {
        e.preventDefault();
        const translation = google ? google.translation : null;
        if (translation) {
          let voice = '';
          if (translation[0][5] && translation[0][5][0] && translation[0][5][0][0]) {
            voice = translation[0][5][0][0];
          }
          if (translation[0][0]) {
            voice = translation[0][0];
          }
          playAudio(voice, langs.selected.to, 'to');
        }
      }

      if (e.shiftKey && e.ctrlKey && e.altKey && e.key === 'Backspace') {
        openDevtools();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
};

export default useWindowKeyDown;
