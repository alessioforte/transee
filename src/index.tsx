import React from 'react';
import { render } from 'react-dom';
import { GlobalStyle } from './theme/GlobalStyle';
import { App, About, Welcome, Preferences } from './windows';
import { Provider } from './store';
import { reducer, actions } from './store/reducer';
import Settings, { initialData } from '../settings';
import { useStore } from './store';

const mainElement = document.createElement('div');
mainElement.setAttribute('id', 'root');
document.body.appendChild(mainElement);

// Settings.delete();
const settings = Settings.get() || {};
const merged = {
  ...initialData,
  ...settings,
};

const VIEWS = {
  main: App,
  about: About,
  welcome: Welcome,
  preferences: Preferences,
};

const Dev = () => <div>Electron <span>❤</span> React</div>;

const ViewManager = () => {
  const name = window.location.search.substr(1);
  if (!name) throw new Error('Error');

  const [store, actions] = useStore();
  const Component = VIEWS[name] || Dev;

  return (
    <>
      <GlobalStyle />
      <Component global={{ store, actions }} />
    </>
  );
};

render(
  <Provider initialState={merged} reducer={reducer} actions={actions}>
    <ViewManager />
  </Provider>,
  mainElement
);
