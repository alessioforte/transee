import React from 'react';
import styled from 'styled-components';
import { Toggle, RecordShortcut } from '../../components';
import Layout from '../../containers/Layout';
import theme, { getColorLuminance } from '../../theme';

const Preferences = ({ locals }) => {
  const { store, actions } = locals;
  const { shortcut, startAtLogin, checkUpdates, theme } = store;
  const {
    setCheckUpdates,
    setShortcut,
    setStartAtLogin,
    restoreSettings,
    setTheme,
  } = actions;

  const handleSetTheme = ({ value }) => {
    let mode = 'light';
    if (value) {
      mode = 'dark';
    }
    setTheme(mode);
  };

  return (
    <Layout title="Preferences">
      <Option>
        <Label>
          Auto start at login
          <Toggle
            name="login"
            initialValue={startAtLogin}
            onChange={(data) => setStartAtLogin(data.value)}
          />
        </Label>
      </Option>

      <Option>
        <Label>
          Check automatically for updates
          <Toggle
            name="update"
            initialValue={checkUpdates}
            onChange={(data) => setCheckUpdates(data.value)}
          />
        </Label>
      </Option>

      <Option>
        <Label>
          Dark mode
          <Toggle
            name="theme"
            initialValue={theme === 'dark'}
            onChange={handleSetTheme}
          />
        </Label>
      </Option>

      <Option>
        <Label>
          Define a shortcut
          <RecordShortcut
            initialValue={shortcut}
            onChange={(data) => setShortcut(data.value)}
          />
        </Label>
        <Comment>
          The shortcut must contain at least ctrl or cmd, you can add shift or
          alt if you want, and finally a letter or number. Pay attention to not
          use a system shortcuts or any other that can interfere with other
          programs.
        </Comment>
      </Option>

      <Option>
        <Label>
          Restore default settings
          <Button onClick={restoreSettings}>Restore</Button>
        </Label>
        <Comment>Transee will be restarted.</Comment>
      </Option>
    </Layout>
  );
};

export default Preferences;

const { colors } = theme;

const Option = styled.div`
  height: auto;
  padding: 14px 18px;
  border-bottom: 1px solid ${colors.flatground};
`;
const Label = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${colors.text.main};
  width: 100%;
  padding: 0;
  font-size: 14px;
`;
const Comment = styled.div`
  font-size: 12px;
  color: ${colors.text.soft};
  padding-top: 9px;
`;
const Button = styled.button`
  border: 0;
  background: ${colors.primary};
  color: ${colors.text.main};
  padding: 3px 16px;
  border-radius: 3px;
  &:focus {
    outline: none;
  }
  &:hover {
    background: ${getColorLuminance(colors.primary, 0.1)};
  }
  &:active {
    background: ${getColorLuminance(colors.primary, 0.3)};
  }
`;
