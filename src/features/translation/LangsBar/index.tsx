import {
  useState,
  useEffect,
  FunctionComponent,
  useRef,
  MutableRefObject,
  KeyboardEvent,
} from 'react';
import { Icon, ScrollArea } from '@/shared/ui';
import { Props, Option, Conversion, Target, Langs } from './interfaces';
import { selectLangs, invertLangs } from './actions';
import { AUTO } from '../langs';
import useDropdown from '@/shared/hooks/useDropdown';
import { forceFocusOnInput } from '@/shared/dom';
import styles from './LangsBar.module.css';

const IDLE = 'var(--color-idle)';
const IDLE_HOVER = 'var(--color-idle-hover)';

const defaultValues: Langs = {
  threesome: {
    from: [
      { value: 'en', label: 'English' },
      { value: 'it', label: 'Italian' },
      { value: 'es', label: 'Spanish' },
    ],
    to: [
      { value: 'it', label: 'Italian' },
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
    ],
  },
  selected: { from: 'en', to: 'it' },
};

const LangsBar: FunctionComponent<Props> = ({
  options = { from: [], to: [] },
  values = defaultValues,
  detected,
  onChange = () => null,
  onToggleDropdown = () => null,
  onResize = () => null,
}: Props) => {
  const dropdown: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const { selected, threesome } = values;
  const [side, setSide] = useState(Conversion.from);
  const [filter, setFilter] = useState('');
  const { isOpen, show, close } = useDropdown();

  useEffect(() => {
    onToggleDropdown(isOpen);
    if (!isOpen) setFilter('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Filtering changes the dropdown's height, and with it the window's.
  useEffect(() => {
    if (isOpen) onResize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, side, isOpen]);

  const query = filter.trim().toLocaleLowerCase();
  const matches = query
    ? options[side].filter(
        (item: Option) =>
          item.label.toLocaleLowerCase().includes(query) ||
          item.value.toLocaleLowerCase() === query
      )
    : options[side];

  const select = (target: Target, opt: Option) => {
    const data = selectLangs(values, target, opt);
    onChange(data);
    close();
    forceFocusOnInput();
  };

  const invert = () => {
    const data = invertLangs(values, detected);
    onChange(data);
    forceFocusOnInput();
  };

  const onFilterKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && matches.length > 0) {
      e.preventDefault();
      select(side, matches[0]);
    }
    if (e.key === 'Escape') {
      // Keeps the window-level handler from hiding the whole bar.
      e.preventDefault();
      e.stopPropagation();
      close();
      forceFocusOnInput();
    }
  };

  const labelOf = (opt: Option) =>
    opt.value === AUTO && detected ? `${detected.label} - Detected` : opt.label;

  const showDropdown = (
    e: { stopPropagation: () => void },
    conversion: Conversion
  ) => {
    e.stopPropagation();
    if (conversion === side && isOpen) {
      close();
      forceFocusOnInput();
    } else {
      setSide(conversion);
      show();
    }
  };

  const renderLang = (opt: Option, target: Target) => (
    // A <button>, so Tauri excludes it from the parent drag region for free.
    <button
      key={opt.value}
      className={styles.lang}
      data-active={opt.value === selected[target]}
      disabled={opt.value === selected[target]}
      onClick={() => select(target, opt)}
    >
      {labelOf(opt)}
    </button>
  );

  const renderCaret = (conversion: Conversion, position: 'left' | 'right') => (
    // A plain div with onClick: Tauri's clickable-element heuristic
    // (A/BUTTON/INPUT/SELECT/TEXTAREA/LABEL/SUMMARY, [tabindex], ARIA roles)
    // does not cover it, so it needs the explicit drag opt-out that
    // `-webkit-app-region: no-drag` used to provide.
    <div
      className={styles.caret}
      data-tauri-drag-region="false"
      data-open={isOpen && side === conversion}
      data-position={position}
      onClick={(e) => showDropdown(e, conversion)}
    >
      <Icon name="caret" size={5} color={IDLE} hoverColor={IDLE_HOVER} hover />
    </div>
  );

  return (
    <>
      {/* "deep" so the gaps between the language buttons drag the window, as
          they did in Electron where `drag` was inherited by the wrappers. */}
      <div className={styles.bar} data-tauri-drag-region="deep">
        <div className={styles.threesome}>
          {renderCaret(Conversion.from, 'left')}
          {threesome.from.map((opt: Option) => renderLang(opt, Conversion.from))}
        </div>

        <div
          className={styles.invert}
          data-tauri-drag-region="false"
          onClick={invert}
        >
          <Icon
            name="translate"
            size={14}
            color={IDLE}
            hoverColor={IDLE_HOVER}
            hover
          />
        </div>

        <div className={`${styles.threesome} ${styles.to}`}>
          {threesome.to.map((opt: Option) => renderLang(opt, Conversion.to))}
          {renderCaret(Conversion.to, 'right')}
        </div>
      </div>
      {isOpen && (
        // Clicks inside stay inside: `useDropdown` dismisses on any window
        // click, which would otherwise close it when the filter is clicked.
        <div
          className={styles.dropdown}
          ref={dropdown}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            className={styles.filter}
            value={filter}
            placeholder="Search languages"
            aria-label="Search languages"
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={onFilterKeyDown}
            autoFocus
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
          />
          <ScrollArea className={styles.scroll} label="Languages">
            {matches.length === 0 && (
              <div className={styles.empty}>No languages found</div>
            )}
            <div className={styles.list}>
              {matches.map((item: Option) => (
                <div
                  key={item.value}
                  className={styles.item}
                  title={item.label}
                  data-in-bar={threesome[side].some(
                    (l: Option) => l.value === item.value
                  )}
                  data-active={item.value === selected[side]}
                  onClick={() => select(side, item)}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </>
  );
};

export default LangsBar;
