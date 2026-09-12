import { createRoot } from 'react-dom/client';
import { GlobalStyle } from './theme/GlobalStyle';
import { Tooltip } from './components';
import { App, About, Welcome, Preferences } from './windows';
import { useStore } from './store';
import { bootSettings } from './platform';

const container = document.getElementById('root')!;
const root = createRoot(container);

Tooltip.setRoot(container, 'root-tooltip');

// Injected by Rust before this script runs, so the hydration is still
// synchronous — see src-tauri/src/windows.rs `bootstrap_script`.
useStore.setState(state => ({
  ...state,
  ...bootSettings
}))

const Dev = () => (
  <div>
    Tauri <span>❤</span> React
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

  const store = useStore()

  return (
    <>
      <GlobalStyle $bar={name === 'main'} />
      <Component store={store} />
    </>
  );
};

root.render(<ViewManager />);
