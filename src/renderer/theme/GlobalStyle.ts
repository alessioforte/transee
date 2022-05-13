import { createGlobalStyle, css } from 'styled-components';
import theme from './index';
import { isWinPlatform } from 'renderer/utils';

const { colors } = theme;

const scrollBarStyles = css`
  *::-webkit-scrollbar {
    width: 12px;
    height: 0;
  }

  *::-webkit-scrollbar-track {
    background: ${theme.colors.background};
  }

  *::-webkit-scrollbar-thumb {
    background-color: ${theme.colors.groundzero};
    border-radius: 20px;
    border: 2px solid ${theme.colors.background};
  }
`

export const GlobalStyle = createGlobalStyle`
  * {
    font-family: 'Nunito', sans-serif;
    font-weight: 300;
    margin: 0;
    padding: 0;
  }
  body {
    overflow: hidden;
    color: ${colors.text.main};
  }

  ${isWinPlatform() && scrollBarStyles}
`;
