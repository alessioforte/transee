import { FC } from 'react';
import { createRoot } from 'react-dom/client';
import { Tooltip } from '@/shared/ui';
import TranslationBar from '@/features/translation/TranslationBar';
import AboutWindow from '@/features/about/AboutWindow';
import WelcomeWindow from '@/features/onboarding/WelcomeWindow';
import PreferencesWindow from '@/features/settings/PreferencesWindow';
import { platform } from '@/platform';
import '@/shared/styles/global.css';

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
  main: TranslationBar,
  about: AboutWindow,
  welcome: WelcomeWindow,
  preferences: PreferencesWindow,
};

const Component = VIEWS[name] || Dev;

root.render(<Component />);
