import React from 'react';
import styled from 'styled-components';
import { Toggle, RecordShortcut } from '../../components';
import theme from '../../theme';
import { isMac } from '../../utils';

const { frameColor } = theme.colors;

const Preferences = ({ global }) => {
  const { store, actions } = global;
  const { shortcut, startAtLogin, checkUpdates } = store;
  console.log(store);

  const setStartAtLogin = (data) => {
    console.log(data);
    // let check = !this.state.startLogin;
    // this.setState({ startLogin: check });
    // settings.set('start-login', check);
    // ipcRenderer.send('set-start-login', check);
  };

  const setCheckAutomaticallyUpdates = (data) => {
    console.log(data);
    // let check = !this.state.checkAutomaticallyUpdates;
    // this.setState({ checkAutomaticallyUpdates: check });
    // settings.set('check-automatically-updates', check);
  };

  const setShortcut = (data) => {
    console.log(data);
  }

  const restoreSettings = () => {
    // settings.deleteAll();
    // ipcRenderer.send('restore-settings');
  };

  return (
    <Win>
      {isMac && <Frame>Preferences</Frame>}
      <div>
        <Option>
          <Label>
            Auto start at login
            <Toggle
              name="login"
              initialValue={startAtLogin}
              onChange={setStartAtLogin}
            />
          </Label>
        </Option>

        <Option>
          <Label>
            Check automatically for updates
            <Toggle
              name="update"
              initialValue={checkUpdates}
              onChange={setCheckAutomaticallyUpdates}
            />
          </Label>
        </Option>

        <Option>
          <Label>
            Define a shortcut
            <RecordShortcut
              initialValue={shortcut}
              onChange={setShortcut}
            />
          </Label>
          <Comment>
            The shortcut must contain at least ctrl or cmd, you can add shift or
            alt if you want, and finally a letter or number. Pay attention to
            not use a system shortcuts or any other that can interfere with
            other programs.
          </Comment>
        </Option>

        <Option>
          <Label>
            Restore default settings
            <Button onClick={() => restoreSettings()}>Restore</Button>
          </Label>
          <Comment>Transee will be restarted.</Comment>
        </Option>
      </div>
    </Win>
  );
};

export default Preferences;

const Win = styled.div`
  display: flex;
  flex-direction: column;
  user-select: none;
  cursor: default;
`;
const Frame = styled.div`
  color: #aaa;
  background: ${frameColor};
  padding-top: 5px;
  height: 18px;
  font-size: 12px;
  text-align: center;
  -webkit-app-region: drag;
  -webkit-user-select: none;
`;
const Option = styled.div`
  height: auto;
  padding: 14px 18px;
  color: #ccc;
  border-bottom: 1px solid rgba(85, 85, 85, 0.3);
`;
const Label = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0;
  font-size: 14px;
`;
const Comment = styled.div`
  font-size: 12px;
  color: #999;
  padding-top: 9px;
`;
const Button = styled.button`
  border: 0;
  background: #2182bd;
  color: #fff;
  padding: 3px 16px;
  border-radius: 3px;
  &:focus {
    outline: none;
  }
  &:hover {
    background: #238ed1;
  }
  &:active {
    box-shadow: inset 0 0 10px 1px #0464a0;
  }
`;
