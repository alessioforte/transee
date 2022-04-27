// import React from 'react';
import { createRoot } from 'react-dom/client';
import { GlobalStyle } from './theme/GlobalStyle';
import { Tooltip } from './components';
import { App, About, Welcome, Preferences } from './windows';

const container = document.getElementById('root')!;
const root = createRoot(container);

Tooltip.setRoot(container, 'root-tooltip');

const Dev = () => (
  <div>
    Electron <span>❤</span> React
  </div>
);

const VIEWS: any = {
  main: App,
  about: About,
  welcome: Welcome,
  preferences: Preferences,
};

const ViewManager = () => {
  const name = window.location.search.substr(1);
  if (!name) throw new Error('page not found');

  const Component = VIEWS[name] || Dev;

  return (
    <>
      <GlobalStyle />
      <Component />
    </>
  );
};

root.render(<ViewManager />);
