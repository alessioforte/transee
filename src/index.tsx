import React from 'react';
import { render } from 'react-dom';
import { GlobalStyle } from './theme/GlobalStyle';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { App, About, Welcome, Preferences } from './windows';
import { Provider } from './store';
import { reducer, actions } from './store/reducer';
import Settings, { initialData } from '../settings';

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

const ViewManager = () => {
  const name = window.location.search.substr(1);
  if (!name) {
    throw new Error('Error');
  }

  return (
    <>
      <GlobalStyle />
      <Router>
        <Route path="/" component={VIEWS[name]} />
      </Router>
    </>
  );
};

render(
  <Provider initialState={merged} reducer={reducer} actions={actions}>
    <ViewManager />
  </Provider>,
  mainElement
);
