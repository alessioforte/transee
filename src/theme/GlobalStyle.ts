import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    font-family: 'Nunito', sans-serif;
    font-weight: 300;
    margin: 0;
    padding: 0;
  }

  *::-webkit-scrollbar {
    display: ${window.navigator.platform === 'MacIntel' ? '' : 'none'}
  }
`;
