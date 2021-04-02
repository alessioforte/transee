import { ipcRenderer } from 'electron';
import {
  getHints,
  // getReversoSuggest,
  getTranslation,
  // getReversoTranslation,
  playAudio,
} from '../services';
import Settings from '../../settings';

export const buildActions = ({ setters }): any => {
  const {
    setSuggestions,
    setReversoSuggestions,
    setGoogle,
    setInput,
    setLoading,
    setTheme,
    setReverso,
    setLangs,
    setShortcut,
    setEngine,
    setSearch,
    setShowWelcome,
    setStartAtLogin,
    setCheckUpdates,
    restoreSettings,
    clearData,
    setVoiceSpeed,
    enableEngines,
  } = setters;

  return {
    getData: async (text: string, langsSelected) => {
      setLoading(true);
      const isUppercase = /[A-Z]/.test(text);
      const hasDoubleSpace = /\s\s+/.test(text);
      const hasSpaceAtFirst = text && text.charAt(0) === ' ';
      const isNewLine = /\n/g.test(text);

      let hints: [] = [];
      if (
        !text ||
        isUppercase ||
        hasDoubleSpace ||
        hasSpaceAtFirst ||
        isNewLine
      ) {
        setSuggestions([]);
      } else {
        hints = (await getHints(text, langsSelected)) as [];
        // const reversoHints = await getReversoSuggest(text, langsSelected);
        // if (hints) {
        //   setSuggestions(hints);
        // }
      }

      if (!text) {
        setGoogle({ data: null, hints: [], payload: null });
        // setReverso(null);
      } else {
        const google = await getTranslation(text, langsSelected);
        if (google) {
          let payload: null | string = null;
          if (google.translation[1] && google.translation[1][0]) {
            payload = google.translation[1][0];
          } else if (
            google.translation[0][5] &&
            google.translation[0][5][0][0]
          ) {
            payload = google.translation[0][5][0][0];
          }

          setGoogle({ data: google, hints: hints || [], payload });
        }
        // const reverso = await getReversoTranslation(text, langsSelected);
        // if (reverso) {
        //   setReverso(reverso);
        // }
      }
      setSearch(text);
      setLoading(false);
    },
    setLangs: (payload) => {
      setLangs(payload);
      Settings.set('langs', payload);
    },
    setTheme: (payload) => {
      setTheme(payload);
      Settings.set('theme', payload);
    },
    setShortcut: (payload) => {
      setShortcut(payload);
      Settings.set('shortcut', payload);
      ipcRenderer.send('change-shortcut', payload);
    },
    setEngine: (payload) => {
      setEngine(payload);
      Settings.set('engine', payload);
    },
    enableEngines: (payload) => {
      enableEngines(payload);
      Settings.set(payload.name, payload.value);
    },
    setShowWelcome: (payload) => {
      setShowWelcome(payload);
      Settings.set('showWelcome', payload);
    },
    setStartAtLogin: (payload) => {
      setStartAtLogin(payload);
      Settings.set('startAtLogin', payload);
      ipcRenderer.send('set-start-login', payload);
    },
    setCheckUpdates: (payload) => {
      setCheckUpdates(payload);
      Settings.set('checkUpdates', payload);
    },
    restoreSettings: (payload) => {
      restoreSettings(payload);
      Settings.delete();
      ipcRenderer.send('restore-settings');
    },
    clearData,
    setSuggestions,
    setReversoSuggestions,
    setGoogle,
    setReverso,
    setInput,
    setLoading,
    setSearch,
    playAudio: (text, lang, conversion, speed) => {
      const voiceSpeed = !speed[conversion];
      speed[conversion] = voiceSpeed;
      setVoiceSpeed(speed);
      playAudio(text, lang, voiceSpeed);
    },
  };
};
