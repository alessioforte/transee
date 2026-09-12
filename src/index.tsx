import { FC } from 'react';
import { createRoot } from 'react-dom/client';
import { Tooltip } from './components';
import { App, About, Welcome, Preferences } from './windows';
import { platform } from './platform';
import './shared/styles/global.css';

const container = document.getElementById('root')!;
const root = createRoot(container);

const name = window.location.search.substr(1);

// global.css keys the transparent bar background and the Windows-only scrollbar
// styling off these, replacing the JS conditionals that used to live inside a
// styled-components `createGlobalStyle`.
document.documentElement.dataset.window = name;
document.documentElement.dataset.platform = platform;

Tooltip.setRoot(container, 'root-tooltip');

const Dev = () => (
  <div>
    Tauri <span>❤</span> React
  </div>
);

const VIEWS: Record<string, FC> = {
  main: App,
  about: About,
  welcome: Welcome,
  preferences: Preferences,
};

const Component = VIEWS[name] || Dev;

root.render(<Component />);
