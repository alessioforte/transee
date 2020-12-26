import React, { useState, FC, useEffect } from 'react';
import styled from 'styled-components';
import { SearchbarData } from '../../containers/Searchbar/interfaces';
import { Options, Conversion } from '../../containers/LangsBar/interfaces';
import { Icon, Tooltip } from '../../components';
import LangsBar from '../../containers/LangsBar';
import Searchbar from '../../containers/Searchbar';
import { selectLangs, invertLangs } from '../../containers/LangsBar/actions';
import { langsFrom, langsTo } from '../../services/langs';
import { setMainWindowSize } from '../../utils';
import StickyCards from '../../containers/StickyCards';
import { useWindowKeyDown } from '../../hooks';
import theme, { getColorLuminance } from '../../theme';

const options: Options = {
  from: Object.entries(langsFrom).map(([key, value]) => ({
    label: value,
    value: key,
  })),
  to: Object.entries(langsTo).map(([key, value]) => ({
    label: value,
    value: key,
  })),
};

type P = {
  locals: any;
};

const App: FC<P> = ({ locals }) => {
  useWindowKeyDown(locals);
  const { store, actions } = locals;
  const [isDropped, setIsDropped] = useState<boolean>(false);
  console.debug('store', store);
  const {
    setSuggestions,
    setLangs,
    setInput,
    setEngine,
    getData,
    playAudio,
    clearData,
  } = actions;
  const {
    suggestions,
    google,
    input,
    search,
    reverso,
    loading,
    engine,
    langs,
    speed,
  } = store;
  const { selected } = langs;

  let translation = '';
  if (engine === 'google' && store[engine]) {
    if (store[engine].translation[0][0] || store[engine].translation[0][1]) {
      translation = store[engine].translation[0][0];
    } else if (
      store[engine].translation[0][5] &&
      store[engine].translation[0][5][0][0]
    ) {
      translation = store[engine].translation[0][5][0][0];
    }
  }
  if (engine === 'google' && !google) {
    translation = store.reverso ? store.reverso.translation : '';
  }
  // if (engine === 'reverso' && !reverso) {
  //   translation = store.google ? store.google.translation : '';
  // }

  useEffect(() => {
    setMainWindowSize();
  }, [isDropped, store]);

  const onInputDebounce = ({ value }: SearchbarData) => {
    getData(value, selected);
  };

  const onInputChange = ({ value }: SearchbarData) => {
    if (value === '') {
      clearData();
    }
  };

  const handleOnLangsChange = (data) => {
    setLangs(data);
    if (translation) {
      clearData();
      setInput(translation);
      getData(translation, data.selected);
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

  const handleActionsInCards = (data) => {
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
    conversion: string
  ) => {
    const text = value.toString();
    playAudio(text, lang, conversion, speed);
  };

  const renderTips = () =>
    google && (
      <Tips>
        {google?.correction?.text.value && (
          <p>
            Did you mean{' '}
            <i
              onClick={() => handleClickOnDYM(google?.correction?.text?.value)}
            >
              {google?.correction?.text?.value}
            </i>
          </p>
        )}
        {google?.correction?.language?.iso !== selected.from && (
          <p>
            Translate from{' '}
            <i
              onClick={() =>
                handleClickOnISO(google?.correction?.language?.iso)
              }
            >
              {langsFrom[google?.correction?.language?.iso]}
            </i>
          </p>
        )}
      </Tips>
    );

  const renderIcons = () =>
    google && (
      <Icons>
        <div className="left">
          <span onClick={() => handlePlayAudio(search, selected.from, 'from')}>
            <Icon name="speaker" size={15} hover />
          </span>
        </div>
        <div />
      </Icons>
    );

  return (
    <Wrapper>
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
            initialValue={input}
            delay={900}
            isError={false}
            message="Service Unavailable"
            // renderTips={renderTips}
            renderIcons={renderIcons}
            loading={loading}
          />
          {(google || reverso) && (
            <>
              <Block>
                {google && google.pronunciation && (
                  <Pronunciation>{google.pronunciation}</Pronunciation>
                )}
                <Box>
                  <Searchbar initialValue={translation} disabled />
                  <Icons>
                    <div className="left">
                      <span
                        onClick={() =>
                          handlePlayAudio(translation, selected.to, 'to')
                        }
                      >
                        <Icon name="speaker" size={15} hover />
                      </span>
                    </div>
                    <div className="right">
                      {google && (
                        <span onClick={() => setEngine('google')}>
                          <Tooltip content="Google Translate">
                            <Icon
                              name="google"
                              size={15}
                              color={
                                engine === 'google'
                                  ? colors.text.active
                                  : colors.text.idle
                              }
                              hover
                            />
                          </Tooltip>
                        </span>
                      )}
                      {reverso && (
                        <span onClick={() => setEngine('reverso')}>
                          <Tooltip content="Reverso Context">
                            <Icon
                              name="reverso"
                              size={15}
                              color={
                                engine === 'reverso'
                                  ? colors.text.active
                                  : colors.text.idle
                              }
                              hover
                            />
                          </Tooltip>
                        </span>
                      )}
                    </div>
                  </Icons>
                </Box>
              </Block>
              {!(!google && !reverso) && (
                <StickyCards
                  google={google}
                  reverso={reverso}
                  onClick={handleActionsInCards}
                />
              )}
            </>
          )}
        </div>
      )}
    </Wrapper>
  );
};

export default App;

const { colors } = theme;

const Wrapper = styled.div`
  overflow: hidden;
`;
const Block = styled.div``;
const Box = styled.div`
  border-top: 1px solid ${colors.idle};
  height: 100%;
`;
const Pronunciation = styled.div`
  padding: 3px 18px;
  font-size: 14px;
  border-top: 1px solid ${colors.foreground};
  color: ${colors.idle};
`;
const Icons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 18px;
  span {
    cursor: pointer;
  }
  .right {
    span {
      margin-left: 5px;
    }
  }
`;
const Tips = styled.div`
  font-size: 14px;
  color: ${colors.idle};
  margin: 6px 18px;
  cursor: default;
  p {
    margin: 0;
  }
  i {
    color: ${colors.text.info};
    transition: all 0.1s ease-out;
  }
  i:hover {
    color: ${getColorLuminance(colors.text.info, 0.5)};
  }
  i:active {
    color: ${getColorLuminance(colors.text.info, 0.9)};
  }
`;
