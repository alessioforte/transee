import { FC, useState, useEffect, useMemo } from 'react';
import { SearchbarData } from '../../components/Searchbar/interfaces';
import { Conversion, Langs } from '../../containers/LangsBar/interfaces';
import { Icon, Searchbar, Textarea } from '../../components';
import LangsBar from '../../containers/LangsBar';
import { selectLangs, invertLangs } from '../../containers/LangsBar/actions';
import { langsFrom } from '../../services/langs';
import { setMainWindowSize } from '../../utils';
import StickyCards from '../../containers/StickyCards';
import { useWindowKeyDown } from '../../hooks';
import options from './utils';
import { useSettings } from '@/stores/settings';
import { useTranslation } from '@/stores/translation';
import { toRows } from '../../services/google/parse';
import styles from './App.module.css';

const App: FC = () => {
  useWindowKeyDown();
  const [isDropped, setIsDropped] = useState<boolean>(false);

  const langs = useSettings((s) => s.langs);
  const setLangs = useSettings((s) => s.setLangs);

  const suggestions = useTranslation((s) => s.suggestions);
  const google = useTranslation((s) => s.google);
  const input = useTranslation((s) => s.input);
  const search = useTranslation((s) => s.search);
  const payload = useTranslation((s) => s.payload);
  const loading = useTranslation((s) => s.loading);
  const getData = useTranslation((s) => s.getData);
  const setSuggestions = useTranslation((s) => s.setSuggestions);
  const setInput = useTranslation((s) => s.setInput);
  const playAudio = useTranslation((s) => s.playAudio);
  const clearData = useTranslation((s) => s.clearData);

  const { selected } = langs;
  const translation = useMemo(() => toRows(google), [google]);

  // Depends on what actually changes the rendered height. It used to depend on
  // the whole store object, which zustand replaces on every update, so this
  // fired an IPC resize on essentially every state change.
  useEffect(() => {
    setMainWindowSize();
  }, [isDropped, google, suggestions, loading, input]);

  const onInputDebounce = ({ value }: SearchbarData) => {
    getData(value, selected);
  };

  const onInputChange = ({ value }: SearchbarData) => {
    if (value === '') {
      clearData();
    }
  };

  const handleOnLangsChange = (data: Langs) => {
    setLangs(data);
    if (payload) {
      clearData();
      setInput(payload);
      getData(payload, data.selected);
    }
  };

  const handleClickOnDYM = (text: string) => {
    clearData();
    setInput(text);
    getData(text, selected);
  };

  const handleClickOnISO = (lang: string) => {
    const label = langsFrom[lang];
    const opt = { label, value: lang };
    const data = selectLangs(langs, Conversion.from, opt);
    clearData();
    setLangs(data);
    setInput(search);
    getData(search, data.selected);
  };

  const handleToggleDropdown = (isVisible: boolean) => {
    setIsDropped(isVisible);
  };

  const handleActionsInCards = (data: { value: string; invert?: boolean }) => {
    const { value, invert } = data;
    setSuggestions([]);
    setInput(value);
    let opts = selected;
    if (invert) {
      const data = invertLangs(langs);
      setLangs(data);
      opts = data.selected;
    }

    getData(value, opts);
  };

  const handlePlayAudio = (
    value: string | string[],
    lang: string,
    conversion: 'from' | 'to'
  ) => {
    playAudio(value.toString(), lang, conversion);
  };

  const renderTips = () => {
    if (!Array.isArray(google?.correction)) return null;
    const parser = new DOMParser();
    const tag: string | undefined = google?.correction[0] && google?.correction[0][0][1];

    const correction = tag && parser.parseFromString(tag, 'text/html').documentElement.textContent;
    const iso = google?.correction[1] && google?.correction[1][0] ? google?.correction[1][0] : null;

    return (
      <div className={styles.tips}>
        {correction && (
          <p>
            Did you mean{' '}
            <span
              dangerouslySetInnerHTML={{ __html: correction }}
              onClick={() => handleClickOnDYM(correction)}
            />
          </p>
        )}
        {iso && iso !== selected.from && (
          <p>
            Translate from{' '}
            <span onClick={() => handleClickOnISO(iso)}>{langsFrom[iso]}</span>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      <LangsBar
        options={options}
        onChange={handleOnLangsChange}
        onToggleDropdown={handleToggleDropdown}
        values={langs}
      />
      {!isDropped && (
        <div>
          <Searchbar
            onResize={setMainWindowSize}
            onDebounce={onInputDebounce}
            onChange={onInputChange}
            suggestions={suggestions}
            placeholder="Translate"
            initialValue={input}
            delay={900}
            isError={false}
            message="Service Unavailable"
            renderTips={renderTips}
            loading={loading}
            renderIcons={() =>
              google && (
                <span
                  onClick={() => handlePlayAudio(search, selected.from, 'from')}
                >
                  <Icon name="speaker" size={15} hover />
                </span>
              )
            }
          />
          {google && (
            <>
              <div>
                {google.pronunciation && (
                  <div className={styles.pronunciation}>{google.pronunciation}</div>
                )}
                <div className={styles.box}>
                  {translation.map((t: any) => (
                    <Textarea
                      key={t[0]}
                      value={t[0]}
                      description={t[2]}
                      renderIcons={() => (
                        <span
                          onClick={() =>
                            handlePlayAudio(t[0], selected.to, 'to')
                          }
                        >
                          <Icon name="speaker" size={15} hover />
                        </span>
                      )}
                    />
                  ))}
                </div>
              </div>
              <StickyCards google={google} onClick={handleActionsInCards} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
