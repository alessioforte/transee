import React, { useState, useEffect, FC } from 'react';
import styled, { css } from 'styled-components';
import Icon from '../Icon';
import theme from '../../theme';

type Data = { value: string | null };
type Props = {
  initialValue?: string;
  onChange?: (data: Data) => void;
};

const RecordShortcut: FC<Props> = ({ initialValue, onChange = () => null }) => {
  const [state, setState] = useState({
    modifier: '',
    status: initialValue ? 'success' : 'initial',
    char: '',
    shortcut: initialValue || 'Click to record new shortcut',
  });
  const [showDelete, setShowDelete] = useState(!!initialValue);

  useEffect(() => {
    if (state.status === 'success') {
      onChange({ value: state.shortcut });
    }
  }, [state.status]);

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
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        setShowDelete(true);

        return {
          ...prev,
          status: 'success',
        };
      }
    });
  };

  const clickOnDelete = (e) => {
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
      {state.status === 'success' ? (
        <>
          {state.shortcut.split('+').map((key) => (
            <Short status={state.status}>{key}</Short>
          ))}
        </>
      ) : (
        <Short status={state.status}>{state.shortcut}</Short>
      )}
      {showDelete && (
        <Delete onClick={clickOnDelete}>
          <Icon name="delete" size={14} hover />
        </Delete>
      )}
    </Record>
  );
};

export default RecordShortcut;

const { colors } = theme;

const STATUS = {
  initial: css``,
  register: css`
    color: ${colors.text.soft};
  `,
  success: css`
    background: ${colors.info};
    color: ${colors.text.main};
    font-weight: bold;
  `,
  error: css`
    color: ${colors.text.error};
  `,
};

const Record = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: ${colors.flatground};
  width: 230px;
  height: 50px;
  border-radius: 5px;
  color: ${colors.text.main};
  font-size: 14px;
`;
const Delete = styled.div`
  display: flex;
  align-content: center; 
  align-items: center;
  position: absolute;
  top: 16px;
  right: 9px;
`;
const Short = styled.div<{ status: string }>`
  padding: 9px;
  border-radius: 5px;
  margin: 0 3px;
  ${(props) => STATUS[props.status]};
`;
