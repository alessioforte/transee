import React, {
  useRef,
  useState,
  useEffect,
  FunctionComponent,
  MutableRefObject,
} from 'react';
import styled from 'styled-components';
import { Spinner } from '../../components';
import { Props, Tip } from './interfaces';
import theme from '../../theme';

const Searchbar: FunctionComponent<Props> = ({
  onChange = (data) => null,
  onResize = () => null,
  onDebounce = (data) => null,
  loading = false,
  name = 'textarea',
  delay = 600,
  suggestions = [],
  initialValue = '',
  renderTips,
  renderIcons,
  isError = false,
  message = 'error',
  disabled = false,
}) => {
  const timeout: MutableRefObject<number | undefined> = useRef();
  const input: React.MutableRefObject<HTMLElement | undefined> = useRef();
  const [value, setValue] = useState(initialValue);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [hover, setHover] = useState(-1);

  useEffect(() => {
    setValue(initialValue);
    resizeTextarea();
  }, [initialValue]);

  useEffect(() => {
    if (suggestions.length === 0) {
      setHover(-1);
    }
  }, [suggestions]);

  const resizeTextarea = () => {
    if (input.current) {
      let height = 60;
      input.current.style.height = `${height}px`;
      height = input.current.scrollHeight;
      input.current.style.height = `${height}px`;
      onResize();
    }
  };

  const handleOnChange = (text: string) => {
    onChange({ name, value: text });
    if (onDebounce) {
      window.clearTimeout(timeout.current);
      timeout.current = window.setTimeout(() => {
        setIsTyping(false);
        onDebounce({ name, value: text });
      }, delay);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text: string = e.target.value;
    setValue(text);
    setIsTyping(true);
    handleOnChange(text);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions?.length > 0) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const { length } = suggestions;
        let i = -1;
        if (e.key === 'ArrowUp') i = (hover + length - 1) % length;
        if (e.key === 'ArrowDown') i = (hover + 1) % length;
        setHover(i);
        const text: string = suggestions[i][0];
        setValue(text);
        handleOnChange(text);
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const hint = suggestions[0][0];
        setValue(hint);
        handleOnChange(hint);
      }
    }
  };

  const onSelect = (tip: string) => {
    setValue(tip);
    handleOnChange(tip);
  };

  return (
    <React.Fragment>
      <Container>
        {!isTyping && suggestions?.length > 0 && hover === -1 && value !== '' && (
          <Autocomplete disabled value={suggestions[0][0]} />
        )}
        <Input
          ref={input}
          type="text"
          placeholder="Translate"
          maxLength={5000}
          value={value}
          onChange={onInputChange}
          onKeyDown={onInputKeyDown}
          onKeyUp={resizeTextarea}
          onScrollCapture={resizeTextarea}
          disabled={disabled}
          autoFocus
        />
        {loading && (
          <Loading>
            <Spinner />
          </Loading>
        )}
      </Container>
      {renderIcons && renderIcons()}
      {isError && <Message>{message}</Message>}
      {renderTips && renderTips()}
      {suggestions?.length > 0 && (
        <div>
          {suggestions.map((tip: [string, string], i: number) => (
            <Hint
              key={tip[0]}
              className="sgt"
              onClick={() => onSelect(tip[0])}
              hover={hover === i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(-1)}
            >
              <div>{tip[0]}</div>
              {tip[1] && <div>{tip[1]}</div>}
            </Hint>
          ))}
        </div>
      )}
    </React.Fragment>
  );
};

export default Searchbar;

const { colors } = theme;
/**
 * STYLES
 */
const Container = styled.div`
  position: relative;
  display: flex;
  overflow: hidden;
  width: 100%;
`;
const Input = styled.textarea`
  box-sizing: border-box;
  padding: 18px 44px 18px 18px;
  height: 60px;
  width: 100%;
  max-height: 300px;
  font-size: 18px;
  border: 0;
  background: none;
  resize: none;
  color: ${colors.text.main};
  &:focus {
    outline: none;
  }
`;
const Autocomplete = styled(Input)`
  position: absolute;
  color: ${colors.text.disabled};
  z-index: -1;
`;
const Loading = styled.div`
  position: absolute;
  right: 18px;
  top: 12px;
`;
const Hint = styled.div<{ hover: boolean }>`
  padding: 3px 18px;
  border-top: 1px solid ${colors.flatground};
  color: ${colors.text.soft};
  font-size: 11px;
  cursor: default;
  line-height: 1.2em;
  background: ${(props) =>
    props.hover ? colors.active : 'transparent'};
  & > div:first-child {
    color: ${colors.text.main};
  }
`;
const Message = styled.div`
  padding: 18px;
  color: ${colors.text.error};
`;
