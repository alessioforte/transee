import { createGlobalStyle, css } from 'styled-components';
import theme from './index';
import { isWin } from '@/platform';

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

export const GlobalStyle = createGlobalStyle<{ $bar?: boolean }>`
  * {
    font-family: 'Nunito', sans-serif;
    font-weight: 300;
    margin: 0;
    padding: 0;
  }
  body {
    overflow: hidden;
    color: ${colors.text.main};
    /* Electron painted this via the BrowserWindow backgroundColor option,
       which showed through because the page never set one. A WKWebView paints
       white instead, so the About/Preferences/Welcome windows -- whose Layout
       has no background of its own -- came out white.

       The bar window is the exception: it is transparent so its rounded
       corners can show the desktop through, and paints its own background on
       the App wrapper instead. */
    background: ${(props) => (props.$bar ? 'transparent' : colors.background)};
  }

  ${isWin && scrollBarStyles}
`;
