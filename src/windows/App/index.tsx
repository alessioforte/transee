import React, { useState, FC, useEffect } from 'react';
import styled from 'styled-components';
import { SearchbarData } from '../../components/Searchbar/interfaces';
import { Options, Conversion } from '../../containers/LangsBar/interfaces';
import { Icon, Tooltip, Searchbar, Textarea } from '../../components';
import LangsBar from '../../containers/LangsBar';
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

  // handle masculine and feminine case
  let translation: any[] = [];
  if (engine === 'google' && store.google) {
    if (store.google.translation[0][0] || store.google.translation[0][1]) {
      translation = store.google.translation;
    } else if (Array.isArray(store.google.translation[0][5])) {
      let sentence = '';
      store.google.translation[0][5].forEach((t) => {
        sentence = sentence.concat(t[0], ' ');
      });
      translation = [[sentence]];
    }
  }

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
    if (store.payload) {
      clearData();
      setInput(store.payload);
      getData(store.payload, data.selected);
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

  const renderTips = () => {
    if (!Array.isArray(google?.correction)) return null;
    const parser = new DOMParser();
    const tag: string | undefined =
      google?.correction[0] && google?.correction[0][0][1];

    const correction =
      tag &&
      parser.parseFromString(tag, 'text/html').documentElement.textContent;
    const iso =
      google?.correction[1] && google?.correction[1][0]
        ? google?.correction[1][0]
        : null;

    return (
      <Tips>
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
      </Tips>
    );
  };

  // const renderIcons = () =>
  //   google && (
  //     <Flex>
  //       <div className="left"></div>
  //       <div className="right">
  //         {google && (
  //           <span onClick={() => setEngine('google')}>
  //             <Tooltip content="Google Translate">
  //               <Icon
  //                 name="google"
  //                 size={15}
  //                 color={
  //                   engine === 'google' ? colors.text.active : colors.text.idle
  //                 }
  //                 hover
  //               />
  //             </Tooltip>
  //           </span>
  //         )}
  //         {reverso && (
  //           <span onClick={() => setEngine('reverso')}>
  //             <Tooltip content="Reverso Context">
  //               <Icon
  //                 name="reverso"
  //                 size={15}
  //                 color={
  //                   engine === 'reverso' ? colors.text.active : colors.text.idle
  //                 }
  //                 hover
  //               />
  //             </Tooltip>
  //           </span>
  //         )}
  //       </div>
  //     </Flex>
  //   );

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
            placeholder="Translate"
            initialValue={input}
            delay={900}
            isError={false}
            message="Service Unavailable"
            renderTips={renderTips}
            // renderFooter={renderIcons}
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
          {(google || reverso) && (
            <>
              <Block>
                {google && google.pronunciation && (
                  <Pronunciation>{google.pronunciation}</Pronunciation>
                )}
                <Box>
                  {google &&
                    engine === 'google' &&
                    translation.map((t) => (
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
                  {/* {engine === 'reverso' && store.reverso?.translation && (
                    <Textarea value={store.reverso?.translation} />
                  )} */}
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
// const Flex = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   padding: 3px 18px;
//   span {
//     cursor: pointer;
//   }
//   .right {
//     span {
//       margin-left: 5px;
//     }
//   }
// `;
const Tips = styled.div`
  font-size: 14px;
  color: ${colors.idle};
  margin: 6px 18px;
  cursor: default;
  p {
    margin: 0;
  }
  span {
    color: ${colors.text.info};
    transition: all 0.1s ease-out;
    font-weight: bold;
  }
  span:hover {
    color: ${getColorLuminance(colors.text.info, 0.5)};
    cursor: pointer;
  }
  span:active {
    color: ${getColorLuminance(colors.text.info, 0.9)};
  }
`;
