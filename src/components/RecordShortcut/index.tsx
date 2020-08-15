import React, { useState, FC } from 'react';
import styled, { css } from 'styled-components';
import Icon from '../Icon';

type Data = { value: string | null };
type Props = {
  initialValue?: string;
  onChange?: (data: Data) => void;
};

const RecordShortcut: FC<Props> = ({ initialValue, onChange = () => null }) => {
  // const [modifier, setModifier] = useState('');
  // const [status, setStatus] = useState('success');
  // const [char, setChar] = useState('');
  // const [shortcut, setShortcut] = useState(
  //   initialValue || 'Click to record new shortcut'
  // );
  const [state, setState] = useState({
    modifier: '',
    status: initialValue ? 'success' : 'initial',
    char: '',
    shortcut: initialValue || 'Click to record new shortcut',
  });
  const [showDelete, setShowDelete] = useState(!!initialValue);

  const clickOnRecord = () => {
    if (!showDelete) {
      setState((prev) => ({
        ...prev,
        status: 'register',
        shortcut: 'Type shortcut',
      }));
      setShowDelete(false);

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    e.preventDefault();

    const shift = e.shiftKey ? 'Shift+' : '';
    const ctrl = e.ctrlKey ? 'Ctrl+' : '';
    const alt = e.altKey ? 'Alt+' : '';
    const cmd = e.metaKey ? 'Cmd+' : '';
    const modifier = shift + ctrl + alt + cmd;
    const keyCode = e.keyCode;
    let char = '';

    if ((keyCode > 47 && keyCode < 58) || (keyCode > 64 && keyCode < 91)) {
      char = String.fromCharCode(keyCode);
    }

    const shortcut = `${modifier}${char}`;
    setState({
      modifier,
      status: 'initial',
      char,
      shortcut,
    });
  };

  const handleKeyUp = () => {
    setState((prev) => {
      const isCmdOrCtrl = /cmd|ctrl/i.test(prev.modifier);
      if (!isCmdOrCtrl || prev.char === '') {
        return {
          ...prev,
          shortcut: 'Please type valid shortcut',
          status: 'error',
        };
      } else {
        // settings.set('shortcut', this.state.shortcut);
        // ipcRenderer.send('change-shortcut', this.state.shortcut);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        setShowDelete(true);
        onChange({ value: prev.shortcut });
        return {
          ...prev,
          status: 'success',
        };
      }
    });
  };

  const clickOnDelete = (e) => {
    // ipcRenderer.send('delete-shortcut', null);
    e.stopPropagation();
    setShowDelete(false);
    setState((prev) => ({
      ...prev,
      shortcut: 'Click to record new shortcut',
      status: 'register',
    }));
    onChange({ value: null });
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
  };

  return (
    <Record onClick={clickOnRecord}>
      <Short status={state.status}>{state.shortcut}</Short>
      {showDelete && (
        <Delete onClick={clickOnDelete}>
          <Icon name="delete" size={14} />
        </Delete>
      )}
    </Record>
  );
};

export default RecordShortcut;

const STATUS = {
  initial: css``,
  register: css`
    color: #2182bd;
  `,
  success: css`
    background: #2182bd;
    color: #fff;
  `,
  error: css`
    color: palevioletred;
  `,
};

const Record = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-sizing: border-box;
  background: #333;
  width: 230px;
  height: 50px;
  border-radius: 5px;
  color: #fff;
  font-size: 14px;
`;
const Delete = styled.div`
  position: absolute;
  top: 16px;
  right: 9px;
`;
const Short = styled.div<{ status: string }>`
  padding: 9px;
  border-radius: 5px;
  ${(props) => STATUS[props.status]};
`;
