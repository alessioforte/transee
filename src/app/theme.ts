import { setWindowTheme, watchSetting } from '@/platform';
import { useSettings } from '@/stores/settings';
import { normalizeTheme, type Theme } from '@/types/theme';

/** Runs in every window, before React renders, including newly created ones. */
export function initializeTheme(): () => void {
  let disposed = false;
  let changed = false;
  let unwatch: (() => void) | undefined;

  const apply = (theme: Theme) => {
    document.documentElement.dataset.theme = theme;
    setWindowTheme(theme);
  };

  apply(useSettings.getState().theme);
  const unsubscribe = useSettings.subscribe((state, previous) => {
    if (state.theme !== previous.theme) {
      changed = true;
      apply(state.theme);
    }
  });

  void watchSetting('theme', (value, initial) => {
    // A delayed initial read must not replace a more recent local selection.
    if (disposed || (initial && changed)) return;
    // Receiving a persisted change never writes it back (no event loop).
    useSettings.setState({ theme: normalizeTheme(value) });
  })
    .then((unlisten) => {
      if (disposed) unlisten();
      else unwatch = unlisten;
    })
    .catch((err) => console.error('[transee] theme sync failed', err));

  return () => {
    disposed = true;
    unsubscribe();
    unwatch?.();
  };
}
