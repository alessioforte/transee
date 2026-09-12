import {
  useState,
  useEffect,
  FunctionComponent,
  useRef,
  MutableRefObject,
} from 'react';
import { Icon } from '@/shared/ui';
import { Props, Option, Conversion, Target, Langs } from './interfaces';
import { selectLangs, invertLangs } from './actions';
import useDropdown from '@/shared/hooks/useDropdown';
import { forceFocusOnInput } from '@/shared/dom';
import styles from './LangsBar.module.css';

const IDLE = '#999999'; // --color-idle; Icon takes a colour, not a class

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
  onChange = () => null,
  onToggleDropdown = () => null,
}: Props) => {
  const dropdown: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const { selected, threesome } = values;
  const [side, setSide] = useState(Conversion.from);
  const { isOpen, show, close } = useDropdown();

  useEffect(() => {
    onToggleDropdown(isOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const select = (target: Target, opt: Option) => {
    const data = selectLangs(values, target, opt);
    onChange(data);
    close();
    forceFocusOnInput();
  };

  const invert = () => {
    const data = invertLangs(values);
    onChange(data);
    forceFocusOnInput();
  };

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
      {opt.label}
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
      <Icon name="caret" size={5} color={IDLE} hover />
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
          <Icon name="translate" size={14} color={IDLE} hover />
        </div>

        <div className={`${styles.threesome} ${styles.to}`}>
          {threesome.to.map((opt: Option) => renderLang(opt, Conversion.to))}
          {renderCaret(Conversion.to, 'right')}
        </div>
      </div>
      {isOpen && (
        <div className={styles.dropdown} ref={dropdown}>
          <div className={styles.list}>
            {options[side].map((item: Option) => (
              <div
                key={item.value}
                className={styles.item}
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
        </div>
      )}
    </>
  );
};

export default LangsBar;
