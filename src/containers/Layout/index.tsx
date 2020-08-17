import React, { FC, ReactElement } from 'react'
import styled from 'styled-components';
import theme from '../../theme';
import { isMac } from '../../utils';

type P = {
  title?: string;
  children?: ReactElement | ReactElement[] | string;
}

const { frameColor } = theme.colors;

const Layout: FC<P> = ({ title = '', children }) => {
  return (
    <Win>
      {isMac && <Frame>{title}</Frame>}
      <>{children}</>
    </Win>
  )
}

export default Layout;

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