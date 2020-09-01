import { useEffect } from 'react';
import { invertLangs } from '../containers/LangsBar/actions';

const useWindowKeyDown = ({ store, actions, queries }) => {
  const { setLangs } = actions;
  useEffect(() => {
    window.onkeydown = (e: KeyboardEvent) => {
      // esc
      if (e.keyCode === 27) {
        e.preventDefault();
        // ipcRenderer.send('hide-window', 'hide');
      }

      // alt shify
      if (e.altKey && e.keyCode === 16) {
        const langs = invertLangs(store.langs);
        setLangs(langs);
        const translation = store.google.translation;
        if (translation) {
          queries.getData(translation, langs.selected);
        }
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

      // if (e.shiftKey && e.ctrlKey && e.altKey && e.keyCode === 8) {
      //   ipcRenderer.send('devtools', null);
      // }
    };
  }, [store]);
};

export default useWindowKeyDown;