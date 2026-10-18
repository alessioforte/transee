import {
  Fragment,
  useRef,
  useState,
  useEffect,
  FunctionComponent,
  MutableRefObject,
  ChangeEvent,
  KeyboardEvent,
} from 'react';
import { Spinner } from '@/shared/ui';
import { Props } from './interfaces';
import field from '@/shared/styles/field.module.css';
import styles from './Searchbar.module.css';
import { SEARCHBAR_ID, forceFocusOnInput } from '@/shared/dom';

const Searchbar: FunctionComponent<Props> = ({
  onChange = () => null,
  onResize = () => null,
  onDebounce = () => null,
  loading = false,
  name = 'textarea',
  placeholder = '',
  delay = 600,
  suggestions = [],
  initialValue = '',
  renderTips,
  renderIcons = () => <div />,
  renderFooter,
  isError = false,
  message = 'error',
  disabled = false,
}) => {
  const timeout: MutableRefObject<number | undefined> = useRef(undefined);
  const input = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(initialValue);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [hover, setHover] = useState(-1);

  // Refocus the textarea whenever the window itself takes focus. This used to
  // assign `document.body.onfocus` directly, keyed on a ref (not a valid
  // dependency) and never cleaned up.
  useEffect(() => {
    document.body.addEventListener('focus', forceFocusOnInput);
    return () => document.body.removeEventListener('focus', forceFocusOnInput);
  }, []);

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

  const onInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text: string = e.target.value;
    setValue(text);
    setIsTyping(true);
    handleOnChange(text);
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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
    <Fragment>
      <div className={field.container}>
        {!isTyping &&
          suggestions?.length > 0 &&
          hover === -1 &&
          value !== '' && <textarea
              className={`${styles.input} ${styles.autocomplete}`}
              disabled
              value={suggestions[0][0]}
              readOnly
            />}
        <textarea
          className={styles.input}
          ref={input}
          id={SEARCHBAR_ID}
          placeholder={placeholder}
          maxLength={5000}
          value={value}
          onChange={onInputChange}
          onKeyDown={onInputKeyDown}
          onKeyUp={resizeTextarea}
          onScrollCapture={resizeTextarea}
          disabled={disabled}
          autoFocus
          // WKWebView shows macOS's native autocorrect/replacement popup over
          // the input, which Chromium did not. The app has its own suggestion
          // list, so the system one is noise covering it.
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
        />
        {loading && (
          <div className={field.loading}>
            <Spinner />
          </div>
        )}
        <div className={field.icons}>{!loading && renderIcons && renderIcons()}</div>
      </div>
      {renderFooter && renderFooter()}
      {isError && <div className={field.message}>{message}</div>}
      {renderTips && renderTips()}
      {suggestions?.length > 0 && (
        <div>
          {suggestions.map((tip: [string, string], i: number) => (
            <div
              key={tip[0]}
              className={styles.hint}
              onClick={() => onSelect(tip[0])}
              data-hover={hover === i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(-1)}
            >
              <div>{tip[0]}</div>
              {tip[1] && <div>{tip[1]}</div>}
            </div>
          ))}
        </div>
      )}
    </Fragment>
  );
};

export default Searchbar;
