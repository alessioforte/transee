import { useState, useEffect, FC, MouseEvent } from 'react';
import Icon from '@/shared/ui/Icon';
import styles from './RecordShortcut.module.css';

type Data = { value: string | null };
type Props = {
  initialValue?: string;
  onChange?: (data: Data) => void;
};

/**
 * Produces Electron-style accelerator strings (`Shift+Ctrl+Alt+Cmd+X`). The
 * global-shortcut plugin accepts that grammar verbatim, so nothing translates
 * them on the way to Rust.
 */
const RecordShortcut: FC<Props> = ({ initialValue, onChange = () => null }) => {
  const [state, setState] = useState({
    modifier: '',
    status: initialValue ? 'success' : 'initial',
    char: '',
    shortcut: initialValue || 'Click to record new shortcut',
  });
  const [showDelete, setShowDelete] = useState(!!initialValue);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (state.status === 'success') {
      onChange({ value: state.shortcut });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  // Listeners live in an effect so they are always torn down — previously they
  // were added inside a click handler and only removed on the keyup/delete
  // paths, leaking if the window closed mid-recording.
  useEffect(() => {
    if (!recording) return;

    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();

      const shift = e.shiftKey ? 'Shift+' : '';
      const ctrl = e.ctrlKey ? 'Ctrl+' : '';
      const alt = e.altKey ? 'Alt+' : '';
      const cmd = e.metaKey ? 'Cmd+' : '';
      const modifier = shift + ctrl + alt + cmd;

      // `e.code` replaces the deprecated `e.keyCode`. Both are physical-key
      // based, so this yields the same A-Z / 0-9 characters as before.
      let char = '';
      if (/^Key[A-Z]$/.test(e.code)) char = e.code.slice(3);
      else if (/^Digit[0-9]$/.test(e.code)) char = e.code.slice(5);

      setState({ modifier, status: 'initial', char, shortcut: `${modifier}${char}` });
    };

    const onKeyUp = () => {
      const isCmdOrCtrl = /cmd|ctrl/i.test(state.modifier);
      if (!isCmdOrCtrl || state.char === '') {
        setState((prev) => ({
          ...prev,
          shortcut: 'Please type valid shortcut',
          status: 'error',
        }));
      } else {
        setState((prev) => ({ ...prev, status: 'success' }));
        setShowDelete(true);
        setRecording(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [recording, state.modifier, state.char]);

  const clickOnRecord = () => {
    if (showDelete) return;
    setState((prev) => ({ ...prev, status: 'register', shortcut: 'Type shortcut' }));
    setRecording(true);
  };

  const clickOnDelete = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setShowDelete(false);
    setRecording(false);
    setState((prev) => ({
      ...prev,
      shortcut: 'Click to record new shortcut',
      status: 'register',
    }));
    onChange({ value: null });
  };

  return (
    <div className={styles.record} onClick={clickOnRecord}>
      {state.status === 'success' ? (
        <>
          {state.shortcut.split('+').map((key) => (
            <div key={key} className={styles.short} data-status={state.status}>
              {key}
            </div>
          ))}
        </>
      ) : (
        <div className={styles.short} data-status={state.status}>
          {state.shortcut}
        </div>
      )}
      {showDelete && (
        <div className={styles.delete} onClick={clickOnDelete}>
          <Icon name="delete" size={14} hover />
        </div>
      )}
    </div>
  );
};

export default RecordShortcut;
