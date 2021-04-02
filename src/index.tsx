import React, { useMemo } from 'react';
import { render } from 'react-dom';
import { GlobalStyle } from './theme/GlobalStyle';
import { Tooltip } from './components';
import { App, About, Welcome, Preferences } from './windows';
import { Provider, useStore } from './store';
import { reducer, setters, buildActions, initialState } from './controllers';
import Settings from '../settings';

const mainElement = document.createElement('div');
mainElement.setAttribute('id', 'root');
document.body.appendChild(mainElement);

Tooltip.setRoot(mainElement, 'root-tooltip');

// Settings.delete();
const settings = Settings.get() || {};
const merged = {
  ...initialState,
  ...settings,
};

const VIEWS = {
  main: App,
  about: About,
  welcome: Welcome,
  preferences: Preferences,
};

const Dev = () => (
  <div>
    Electron <span>❤</span> React
  </div>
);

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

render(
  <Provider init={{ initialState: merged, reducer, setters }}>
    <ViewManager />
  </Provider>,
  mainElement
);
