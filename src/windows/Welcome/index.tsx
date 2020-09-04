import React, { useState, FC } from 'react';
import { Checkbox, Icon } from '../../components';
import styled from 'styled-components';
import icon from '../../../assets/icon_256x256.png';
import menubarIMG from '../../../assets/menubar.png';
import taskbarIMG from '../../../assets/taskbar.png';
import Layout from '../../containers/Layout';
import { isWin } from '../../utils';
import theme, { getColorLuminance } from '../../theme';

const barIMG = isWin ? taskbarIMG : menubarIMG;

type P = {
  locals: any;
};

const Welcome: FC<P> = ({ locals }) => {
  const { store, actions } = locals;
  const { shortcut, showWelcome } = store;
  const { setShowWelcome } = actions;
  const barTitle = isWin ? 'Taskbar' : 'Menu bar';
  const barName = isWin ? 'taskbar' : 'menu bar';

  const [active, setActive] = useState(0);
  const [left, setLeft] = useState(0);

  const returnIndex = (i: number) => {
    setActive(i);
    setLeft(i * -414);
  };

  const leftArrow = () => {
    setActive((prev) => prev - 1);
    setLeft((prev) => prev + 414);
  };

  const rightArrow = () => {
    setActive((prev) => prev + 1);
    setLeft((prev) => prev - 414);
  };

  return (
    <Layout title="Welcome Guide">
      <Arrow
        onClick={() => leftArrow()}
        style={{
          left: 40,
          transform: 'rotate(180deg)',
          display: active === 0 ? 'none' : 'block',
        }}
      >
        <Icon name="arrow" />
      </Arrow>

      <Arrow
        onClick={() => rightArrow()}
        style={{
          right: 40,
          display: active === 2 ? 'none' : 'block',
        }}
      >
        <Icon name="arrow" />
      </Arrow>

      <Header>
        <img src={icon} height="80px" />
        <div>
          <Title>Transee</Title>
          <Details>Simple and useful tool for quick translation</Details>
        </div>
      </Header>

      <Cards style={{ marginLeft: left }}>
        <Card>
          <h2>Start</h2>
          Transee is always at your fingertips.
          <br />
          {shortcut ? (
            <>
              Press <Short>{shortcut}</Short> and start.
              <br />
              Click anywhere on your desktop
              <br />
              to hide the translation bar
              <br />
              or press the <Short>Esc</Short> key.
            </>
          ) : (
            <>
              Register a shortcut
              <br />
              for a better user experience
              <br />
              or open translation bar from menu.
              <br />
              <br />
            </>
          )}
          <Note>You can change the shortcut in preferences window.</Note>
        </Card>

        <Card>
          <h2>{barTitle}</h2>
          <img src={barIMG} style={{ margin: 18 }} />
          <br />
          Transee lives in your {barName}
          <br />
          and it starts automatically,
          <br />
          so you can forget about it.
        </Card>

        <Card>
          <h2>Other shortcuts</h2>
          Try them to speed up your translations.
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 9,
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <Row>
                <Short>Tab</Short>
              </Row>
              <Row>
                <Short>Alt+Shift</Short>
              </Row>
              <Row>
                <Short>Ctrl+P</Short>
              </Row>
              <Row>
                <Short>Ctrl+Alt+P</Short>
              </Row>
            </div>
            <div style={{ textAlign: 'left' }}>
              <Row>Complete the suggestion</Row>
              <Row>Invert languages</Row>
              <Row>Listen pronunciation</Row>
              <Row>Listen translated pronunciation</Row>
            </div>
          </div>
        </Card>
      </Cards>

      <Navigator
        items={[0, 0, 0]}
        active={active}
        onClick={(i) => returnIndex(i)}
      />

      <Option>
        <Label>
          <Checkbox
            value={showWelcome}
            onChange={(data) => setShowWelcome(data.value)}
          />
          Show Welcome Guide when opening Transee
        </Label>
      </Option>
    </Layout>
  );
};

const Navigator = ({ onClick, items, active }) => {
  const returnIndex = (e: React.MouseEvent, index: number) => {
    onClick(index);
  };

  return (
    <Dots>
      {items.map((item, i: number) => (
        <Dot
          key={i}
          active={i === active}
          onClick={(e) => returnIndex(e, i)}
        ></Dot>
      ))}
    </Dots>
  );
};

export default Welcome;

const { colors } = theme;

const Header = styled.div`
  margin: 0 18px;
  display: flex;
  justify-content: space-between;
  padding: 3px;
  border-bottom: 1px solid ${colors.flatground};
  color: ${colors.text.main};
`;
const Title = styled.div`
  text-align: right;
  margin-top: 10px;
  font-size: 26px;
`;
const Details = styled.div`
  color: ${colors.text.soft};
  font-size: 16px;
`;
const Row = styled.div`
  font-size: 14px;
  margin: 9px 3px;
`;
const Short = styled.div`
  display: inline;
  padding: 1px 9px;
  background: ${colors.info};
  border-radius: 3px;
  font-size: 14px;
  font-weight: lighter;
`;
const Option = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  padding: 0 18px;
  color: ${colors.text.soft};
  border-top: 1px solid ${colors.flatground};
`;
const Label = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 270px;
  height: 60px;
  font-size: 12px;
`;
const Arrow = styled.div`
  top: 200px;
  position: absolute;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  opacity: 0.3;
  z-index: 3;
  svg {
    fill: gray;
  }
  &:hover svg {
    fill: white;
  }
`;
const Cards = styled.div`
  display: flex;
  flex-direction: row;
  overflow: hidden;
  transition: 0.3s ease;
  padding-left: 53px;
  color: ${colors.text.main};
`;
const Card = styled.div`
  box-sizing: border-box;
  text-align: center;
  font-size: 18px;
  width: 350px;
  border-radius: 5px;
  margin: 0 32px;
  padding: 12px;
  flex-shrink: 0;
  h2 {
    font-size: 24px;
    margin-bottom: 9px;
    color: ${colors.text.info};
  }
`;
const Note = styled.div`
  margin-top: 9px;
  font-size: 12px;
  color: ${colors.text.low};
`;

const Dot = styled.div<{ active: boolean }>`
  box-sizing: border-box;
  background: ${props => props.active ? colors.light : colors.flatground};
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 4px;
  display: inline-block;
`;
const Dots = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: default;
  margin: 9px 0;
`;
