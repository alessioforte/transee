import { createGlobalStyle } from 'styled-components';
import theme from './index';

const { colors } = theme;

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

  *::-webkit-scrollbar {
    display: ${window.navigator.platform === 'MacIntel' ? '' : 'none'}
  }
`;
