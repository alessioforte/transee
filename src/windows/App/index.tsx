import React, { useState, FC, useEffect } from 'react';
import styled from 'styled-components';
import { SearchbarData } from '../../containers/Searchbar/interfaces';
import { Options, Conversion } from '../../containers/LangsBar/interfaces';
import { Icon } from '../../components';
import LangsBar from '../../containers/LangsBar';
import Searchbar from '../../containers/Searchbar';
import { selectLangs } from '../../containers/LangsBar/actions';
import { langsFrom, langsTo } from '../../services/langs';
import { getHints, getTranslation } from '../../services';
import { setMainWindowSize } from '../../utils';
import StickyCards from '../../containers/StickyCards';

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
  global: any;
}

const App: FC<P> = ({ global }) => {
  const { store, actions } = global;
  const [isDropped, setIsDropped] = useState<boolean>(false);
  const [textareaSize, setTextareaSize] = useState<number>(60);

  const langs = store.langs.selected;
  const { setSuggestions, setData, setLangs, setInput } = actions;
  const { suggestions, data, input } = store;
  console.log('store', store);

  const handleToggleDropdown = (isVisible: boolean) => {
    setIsDropped(isVisible);
  };

  useEffect(() => {
    setMainWindowSize();
  }, [isDropped, textareaSize, suggestions, data]);

  const getData = async (text: string, langsSelected) => {
    const isUppercase = /[A-Z]/.test(text);
    const hasDoubleSpace = /\s\s+/.test(text);
    const hasSpaceAtFirst = text.charAt(0) === ' ';
    const isNewLine = /^\s*$/.test(text);
    if (
      !text ||
      isUppercase ||
      hasDoubleSpace ||
      hasSpaceAtFirst ||
      isNewLine
    ) {
      setSuggestions([]);
    } else {
      const hints = await getHints(text, langsSelected);
      if (hints) {
        setSuggestions(hints);
      }
    }

    if (!text) {
      setData(null);
    } else {
      console.log('value', text, langsSelected);
      const translation = await getTranslation(text, langsSelected);
      if (translation) {
        setData(translation);
      }
    }
    setInput(text);
  };

  const onInputDebounce = ({ value }: SearchbarData) => {
    getData(value, langs);
  };

  const handleClickOnDYM = (text: string) => {
    console.log('dym', text);
    setSuggestions([]);
    setInput(text);
  };

  const handleClickOnISO = (lang: string) => {
    const label = langsFrom[lang];
    const opt = { label, value: lang };
    const data = selectLangs(store.langs, Conversion.from, opt);
    setLangs(data);
    getData(input, data.selected);
  };

  const renderTips = () =>
    data && (
      <Tips>
        {data.correction.text.value && (
          <p>
            Did you mean{' '}
            <i onClick={() => handleClickOnDYM(data.correction.text.value)}>
              {data.correction.text.value}
            </i>
          </p>
        )}
        {data.correction.language.iso !== langs.from && (
          <p>
            Translate from{' '}
            <i onClick={() => handleClickOnISO(data.correction.language.iso)}>
              {langsFrom[data.correction.language.iso]}
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
            showIcons={!!data}
            isError={false}
            message="Service Unavailable"
            renderTips={renderTips}
          />
          {data && (
            <>
              <Block>
                {data.pronunciation && (
                  <Pronunciation>{data.pronunciation}</Pronunciation>
                )}
                <Box>
                  <Translation
                    id="translation"
                    value={data.translation}
                    disabled
                  />
                  <Icons>
                    <span onClick={() => console.log('voice')}>
                      <Icon name="speaker" size={15} />
                    </span>
                  </Icons>
                </Box>
              </Block>
              <StickyCards data={data} />
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
  width: 16px;
  margin: 0 18px 3px;
`;
const Tips = styled.div`
  font-size: 14px;
  color: #999;
  padding: 6px 18px;
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
