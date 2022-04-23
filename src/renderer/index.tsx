import React, { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GlobalStyle } from './theme/GlobalStyle';
import { Tooltip } from './components';
import { App, About, Welcome, Preferences } from './windows';
import { Provider, useStore } from './store';
import { reducer, setters, buildActions, initialState } from './controllers';

const container = document.getElementById('root')!;
const root = createRoot(container);

Tooltip.setRoot(container, 'root-tooltip');

// Settings.delete();
const settings = {} // Settings.get() || {};
const merged = {
  ...initialState,
  ...settings,
};

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

  const [store, setStore] = useStore();
  const Component = VIEWS[name] || Dev;

  const actions = useMemo(() => buildActions({ setters: setStore }), []);

  return (
    <>
      <GlobalStyle />
      <Component locals={{ store, actions }} />
    </>
  );
};

root.render(
  <Provider init={{ initialState: merged, reducer, setters }}>
    <ViewManager />
  </Provider>
);
