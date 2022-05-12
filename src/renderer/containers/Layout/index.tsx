import React, { FC, ReactElement } from 'react';
import styled from 'styled-components';
import theme from '../../theme';
import { isMac } from '../../utils';

type P = {
  title?: string;
  children?: ReactElement | ReactElement[] | string;
};

const Layout: FC<P> = ({ title = '', children }) => {
  return (
    <Win>
      {isMac && <Frame>{title}</Frame>}
      <>{children}</>
    </Win>
  );
};

export default Layout;

const { colors } = theme;

const Win = styled.div`
  display: flex;
  flex-direction: column;
  user-select: none;
  cursor: default;
`;
const Frame = styled.div`
  color: ${colors.text.soft};
  background: ${colors.frame};
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  font-weight: bold;
  font-size: 12px;
  text-align: center;
  -webkit-app-region: drag;
  -webkit-user-select: none;
`;
