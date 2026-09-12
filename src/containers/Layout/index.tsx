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
// `-webkit-app-region` is an Electron shell integration and does nothing in
// WKWebView or WebView2; Tauri uses the data attribute instead. "deep" gives
// the Electron semantics of the whole subtree being draggable.
const Frame = styled.div.attrs({ 'data-tauri-drag-region': 'deep' })`
  color: ${colors.text.soft};
  background: ${colors.frame};
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  font-weight: bold;
  font-size: 12px;
  text-align: center;
  -webkit-user-select: none;
`;
