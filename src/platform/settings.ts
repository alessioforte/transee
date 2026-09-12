import { load, type Store } from '@tauri-apps/plugin-store';

const STORE_FILE = 'settings.json';

// Rust holds a handle to the same path; the plugin dedupes by path, so both
// sides see one store. autoSave matches the plugin default (100ms debounce).
let handle: Promise<Store> | null = null;
const store = () => (handle ??= load(STORE_FILE, { autoSave: 100 }));

/**
 * Fire-and-forget write, matching the semantics of the Electron
 * `window.electron.store.set` bridge it replaces. Failures are logged rather
 * than surfaced — losing a preference write should not break the UI.
 */
export async function setSetting(key: string, value: unknown): Promise<void> {
  try {
    const s = await store();
    await s.set(key, value);
  } catch (err) {
    console.error(`[transee] failed to persist "${key}"`, err);
  }
}
