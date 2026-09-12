//! Persisted settings, and a one-time import of the Electron build's config.
//!
//! The Electron app used `electron-store`, which names its directory after
//! `productName` ("Transee"). `tauri-plugin-store` resolves against
//! `BaseDirectory::AppData`, which is the bundle identifier
//! (`com.alessioforte.transee`). So an upgrading user's settings live at a
//! different path and have to be copied across once.

use serde_json::{json, Map, Value};
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_store::StoreExt;

pub const STORE_FILE: &str = "settings.json";
pub const DEFAULT_SHORTCUT: &str = "Ctrl+Alt+T";

/// Bumped only if the shape of the stored data changes. Its presence is also
/// what marks the electron-store import as already done — checking for the file
/// instead would re-import every time the user cleared their settings.
const SCHEMA_VERSION: i64 = 1;

/// Keys worth carrying over from the Electron build. `platform` and `version`
/// are re-derived at startup, so they are deliberately not imported.
const MIGRATED_KEYS: [&str; 5] = [
    "langs",
    "shortcut",
    "showWelcome",
    "startAtLogin",
    "checkUpdates",
];

pub fn get_string<R: Runtime>(app: &AppHandle<R>, key: &str, default: &str) -> String {
    app.store(STORE_FILE)
        .ok()
        .and_then(|s| s.get(key))
        .and_then(|v| v.as_str().map(String::from))
        .unwrap_or_else(|| default.to_string())
}

pub fn get_bool<R: Runtime>(app: &AppHandle<R>, key: &str, default: bool) -> bool {
    app.store(STORE_FILE)
        .ok()
        .and_then(|s| s.get(key))
        .and_then(|v| v.as_bool())
        .unwrap_or(default)
}

pub fn set<R: Runtime>(app: &AppHandle<R>, key: &str, value: Value) {
    if let Ok(store) = app.store(STORE_FILE) {
        store.set(key, value);
    }
}

/// The whole store as a JSON object, for injection into the webview before
/// first paint. The renderer reads its settings synchronously at module load
/// (`src/index.tsx`), and plugin-store has no synchronous API.
pub fn snapshot<R: Runtime>(app: &AppHandle<R>) -> Value {
    let Ok(store) = app.store(STORE_FILE) else {
        return json!({});
    };
    let mut map = Map::new();
    for (key, value) in store.entries() {
        map.insert(key, value);
    }
    Value::Object(map)
}

/// Loads the store, imports Electron settings on first run, and fills in the
/// defaults the Electron main process used to write at startup.
pub fn init<R: Runtime>(app: &AppHandle<R>) -> Result<(), tauri_plugin_store::Error> {
    let store = app.store(STORE_FILE)?;

    if store.get("schemaVersion").is_none() {
        if let Some(legacy) = read_electron_store(app) {
            for key in MIGRATED_KEYS {
                if let Some(value) = legacy.get(key) {
                    store.set(key, value.clone());
                }
            }
        }
        store.set("schemaVersion", json!(SCHEMA_VERSION));
    }

    // Mirrors src/main/main.ts:40,46 — but deliberately WITHOUT the
    // `store.clear()` on version change, which wiped the user's saved
    // languages on every update.
    store.set("platform", json!(std::env::consts::OS));
    store.set("version", json!(app.package_info().version.to_string()));

    if store.get("shortcut").is_none() {
        store.set("shortcut", json!(DEFAULT_SHORTCUT));
    }
    for (key, default) in [
        ("showWelcome", true),
        ("checkUpdates", true),
        ("startAtLogin", false),
    ] {
        if store.get(key).is_none() {
            store.set(key, json!(default));
        }
    }

    store.save()?;
    Ok(())
}

/// Resets to the defaults the Electron `restore-settings` handler wrote
/// (src/main/main.ts:101-109), leaving `langs` to fall back to the renderer's
/// initial state on next launch.
pub fn restore_defaults<R: Runtime>(app: &AppHandle<R>) -> Result<(), tauri_plugin_store::Error> {
    let store = app.store(STORE_FILE)?;
    store.clear();
    store.set("schemaVersion", json!(SCHEMA_VERSION));
    store.set("platform", json!(std::env::consts::OS));
    store.set("version", json!(app.package_info().version.to_string()));
    store.set("shortcut", json!(DEFAULT_SHORTCUT));
    store.set("showWelcome", json!(true));
    store.set("checkUpdates", json!(true));
    store.set("startAtLogin", json!(false));
    store.save()?;
    Ok(())
}

fn read_electron_store<R: Runtime>(app: &AppHandle<R>) -> Option<Map<String, Value>> {
    // macOS: ~/Library/Application Support/Transee/config.json
    // Windows: %APPDATA%\Transee\config.json
    let path = app.path().data_dir().ok()?.join("Transee/config.json");
    let raw = std::fs::read_to_string(path).ok()?;
    match serde_json::from_str(&raw).ok()? {
        Value::Object(map) => Some(map),
        _ => None,
    }
}
