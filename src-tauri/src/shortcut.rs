//! Global shortcut registration.
//!
//! The accelerator strings the Preferences UI produces
//! (`src/components/RecordShortcut/index.tsx:44-56` — `Shift+`/`Ctrl+`/`Alt+`/
//! `Cmd+` plus a single A-Z or 0-9 character) are accepted verbatim by
//! `global-hotkey`, so no translation layer is needed.

use tauri::{AppHandle, Runtime};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

use crate::windows;

/// Registers `accelerator`, replacing whatever was registered before.
///
/// Unlike Electron's `globalShortcut.register`, which returned a boolean nobody
/// checked (src/main/main.ts:56), failures surface here — a conflicting hotkey
/// or an unparseable string is reported back to the caller.
pub fn register<R: Runtime>(app: &AppHandle<R>, accelerator: &str) -> Result<(), String> {
    let manager = app.global_shortcut();
    let _ = manager.unregister_all();
    manager
        .register(accelerator)
        .map_err(|err| format!("could not register \"{accelerator}\": {err}"))
}

/// Handler for every registered shortcut. The plugin reports both `Pressed` and
/// `Released`, so without the filter the bar would toggle twice per keypress.
pub fn on_shortcut<R: Runtime>(
    app: &AppHandle<R>,
    _shortcut: &tauri_plugin_global_shortcut::Shortcut,
    event: tauri_plugin_global_shortcut::ShortcutEvent,
) {
    if event.state() == ShortcutState::Pressed {
        windows::show_bar(app);
    }
}
