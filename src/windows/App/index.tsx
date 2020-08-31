import React, { useState, FC, useEffect } from 'react';
import styled from 'styled-components';
import { SearchbarData } from '../../containers/Searchbar/interfaces';
import { Options, Conversion } from '../../containers/LangsBar/interfaces';
import { Icon, Tooltip } from '../../components';
import LangsBar from '../../containers/LangsBar';
import Searchbar from '../../containers/Searchbar';
import { selectLangs } from '../../containers/LangsBar/actions';
import { langsFrom, langsTo } from '../../services/langs';
import { setMainWindowSize } from '../../utils';
import StickyCards from '../../containers/StickyCards';
import { useWindowKeyDown } from '../../hooks';

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
  const { store, actions, queries } = locals;
  const [isDropped, setIsDropped] = useState<boolean>(false);
  const [textareaSize, setTextareaSize] = useState<number>(60);

  const langs = store.langs.selected;
  const { setSuggestions, setLangs, setInput, setEngine } = actions;
  const { suggestions, google, input, reverso, loading, engine } = store;
  const { getData } = queries;
  // console.log('store', store);

  useEffect(() => {
    setMainWindowSize();
  }, [isDropped, textareaSize, suggestions, google]);

  const onInputDebounce = ({ value }: SearchbarData) => {
    getData(value, langs);
  };

  const handleClickOnDYM = (text: string) => {
    setSuggestions([]);
    setInput(text);
    getData(text, langs);
  };

  const handleClickOnISO = (lang: string) => {
    const label = langsFrom[lang];
    const opt = { label, value: lang };
    const data = selectLangs(store.langs, Conversion.from, opt);
    setLangs(data);
    getData(input, data.selected);
  };

  const handleToggleDropdown = (isVisible: boolean) => {
    setIsDropped(isVisible);
  };

  const renderTips = () =>
    google && (
      <Tips>
        {google.correction.text.value && (
          <p>
            Did you mean{' '}
            <i onClick={() => handleClickOnDYM(google.correction.text.value)}>
              {google.correction.text.value}
            </i>
          </p>
        )}
        {google.correction.language.iso !== langs.from && (
          <p>
            Translate from{' '}
            <i onClick={() => handleClickOnISO(google.correction.language.iso)}>
              {langsFrom[google.correction.language.iso]}
            </i>
          </p>
        )}
      </Tips>
    );

  return (
    <>
      <LangsBar
        options={options}
        onChange={setLangs}
        onToggleDropdown={handleToggleDropdown}
        values={store.langs}
      />
      {!isDropped && (
        <div>
          <Searchbar
            onResize={(size) => setTextareaSize(size)}
            onDebounce={onInputDebounce}
            suggestions={suggestions}
            initialValue={input}
            delay={900}
            showIcons={!!google}
            isError={false}
            message="Service Unavailable"
            renderTips={renderTips}
            loading={loading}
          />
          {google && (
            <>
              <Block>
                {google.pronunciation && (
                  <Pronunciation>{google.pronunciation}</Pronunciation>
                )}
                <Box>
                  <Translation value={store[engine].translation} disabled />
                  <Icons>
                    <div className="left">
                      <span onClick={() => console.log('voice')}>
                        <Icon name="speaker" size={15} />
                      </span>
                    </div>
                    <div className="right">
                      {google && (
                        <span onClick={() => setEngine('google')}>
                          <Tooltip content="Google Translate">
                            <Icon
                              name="google"
                              size={15}
                              color={engine === 'google' ? 'white' : '#444'}
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
                              color={engine === 'reverso' ? 'white' : '#444'}
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
                  onClick={(data) => console.log(data)}
                />
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default App;

const Block = styled.div``;
const Box = styled.div`
  border-top: 1px solid #999;
  height: 100%;
`;
const Pronunciation = styled.div`
  padding: 3px 18px;
  font-size: 14px;
  border-top: 1px solid #555;
  color: #aaa;
`;
const Translation = styled.textarea`
  box-sizing: border-box;
  padding: 18px 44px 18px 18px;
  width: 100%;
  max-height: 300px;
  font-size: 18px;
  border: 0;
  background: none;
  resize: none;
  color: white;
  &::focus {
    outline: none;
  }
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
  color: #999;
  margin: 6px 18px;
  cursor: default;
  p {
    margin: 0;
  }
  i {
    color: #0077b5;
    transition: all 0.1s ease-out;
  }
  i:hover {
    color: #00aff0;
  }
  i:active {
    color: #333;
  }
`;
