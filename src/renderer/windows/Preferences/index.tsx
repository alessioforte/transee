import React, { FC } from 'react';
import styled from 'styled-components';
import { Toggle, RecordShortcut } from '../../components';
import Layout from '../../containers/Layout';
import theme, { getColorLuminance } from '../../theme';

const Preferences: FC = ({ store }) => {
  const {
    shortcut,
    startAtLogin,
    checkUpdates,
    setCheckUpdates,
    setShortcut,
    setStartAtLogin,
    restoreSettings,
    // setTheme,
  } = store;

  return (
    <Layout title="Preferences">
      <Section>
        <Title>Generals</Title>
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

        <Option noBorder>
          <Label>
            Define a shortcut
            <RecordShortcut
              initialValue={shortcut}
              onChange={(data) => data.value && setShortcut(data.value)}
            />
          </Label>
          <Comment>
            The shortcut must contain at least ctrl or cmd, you can add shift or
            alt if you want, and finally a letter or number. Pay attention to
            not use a system shortcuts or any other that can interfere with
            other programs.
          </Comment>
        </Option>

        {/* <Option>
          <Label>
            Dark mode
            <Toggle
              name="theme"
              initialValue={theme === 'dark'}
              onChange={handleSetTheme}
            />
          </Label>
        </Option> */}
      </Section>

      {/* <Section>
        <Title>Engine</Title>
        <Option>
          <Label>
            Google
            <Toggle
              name="googleEnabled"
              initialValue={googleEnabled}
              onChange={(data) => enableEngines(data)}
            />
          </Label>
        </Option>
        <Option noBorder>
          <Label>
            Reverso
            <Toggle
              name="reversoEnabled"
              initialValue={reversoEnabled}
              onChange={(data) => enableEngines(data)}
            />
          </Label>
        </Option>
      </Section> */}

      <Section noBorder>
        <Option noBorder>
          <Label>
            Restore default settings
            <Button onClick={restoreSettings}>Restore</Button>
          </Label>
          <Comment>Transee will be restarted.</Comment>
        </Option>
      </Section>
    </Layout>
  );
};

export default Preferences;

const { colors } = theme;

const Section = styled.div<{ noBorder?: boolean }>`
  height: auto;
  padding: 14px 18px;
  border-bottom: 1px solid
    ${(props) => (props.noBorder ? 'transparent' : colors.upperground)};
`;
const Title = styled.span`
  font-size: 16px;
  color: ${colors.text.primary};
  font-weight: bold;
`;
const Option = styled.div<{ noBorder?: boolean }>`
  height: auto;
  padding: 14px 0;
  border-bottom: 1px solid
    ${(props) => (props.noBorder ? 'transparent' : colors.flatground)};
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
