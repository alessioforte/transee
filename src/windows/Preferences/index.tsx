import React from 'react';
import styled from 'styled-components';
import { Checkbox, Toggle, RecordShortcut } from '../../components';
import theme from '../../theme';
import { ipcRenderer } from 'electron';
import { useStore } from '../../store';

const { frameColor } = theme.colors;

const Preferences = () => {
  const [store, actions] = useStore();
  const { shortcut } = store;
  console.log(store);
  // const startLogin = settings.get('start-login') || false;
  // const checkAutomaticallyUpdates = settings.has('check-automatically-updates')
  //   ? settings.get('check-automatically-updates')
  //   : true;

  // const shortcutInSettings = settings.get('shortcut');

  // const shortcut = shortcutInSettings || 'Click to record new shortcut';
  // const shortStyle = shortcutInSettings ? successShortStyle : defaultShortStyle;
  // const showDelete = shortcutInSettings ? true : false;

  const setStartAtLogin = () => {
    // let check = !this.state.startLogin;
    // this.setState({ startLogin: check });
    // settings.set('start-login', check);
    // ipcRenderer.send('set-start-login', check);
  };

  const setCheckAutomaticallyUpdates = () => {
    // let check = !this.state.checkAutomaticallyUpdates;
    // this.setState({ checkAutomaticallyUpdates: check });
    // settings.set('check-automatically-updates', check);
  };

  const restoreSettings = () => {
    // settings.deleteAll();
    ipcRenderer.send('restore-settings');
  };

  return (
    <Win>
      <Frame
        style={{
          display: `${
            window.navigator.platform === 'MacIntel' ? 'block' : 'none'
          }`,
        }}
      >
        Preferences
      </Frame>
      <div>
        <Option>
          <Label>
            Auto start at login
            {/* <Checkbox
              value={true}
              // value={state.startLogin}
              onClick={() => setStartAtLogin()}
            /> */}
            <Toggle />
          </Label>
        </Option>

        <Option>
          <Label>
            Check automatically for updates
            <Checkbox
              value={true}
              // value={state.checkAutomaticallyUpdates}
              onClick={() => setCheckAutomaticallyUpdates()}
            />
          </Label>
        </Option>

        <Option>
          <Label>
            Define a shortcut
            <RecordShortcut
              initialValue={shortcut}
              onChange={(data) => console.log(data)}
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
const Button = styled.div`
  background: #2182bd;
  color: #fff;
  padding: 3px 16px;
  border-radius: 5px;
  &:hover {
    background: #238ed1;
  }
  &:active {
    box-shadow: inset 0 0 10px 1px #0464a0;
  }
`;
