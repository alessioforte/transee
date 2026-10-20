//! Window creation, the Spotlight-style positioning of the translation bar,
//! and singleton handling for the three auxiliary windows.

use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

use tauri::{AppHandle, Manager, PhysicalPosition, Runtime, WebviewWindow, WebviewWindowBuilder};

use crate::settings;

pub const MAIN: &str = "main";
pub const ABOUT: &str = "about";
pub const PREFERENCES: &str = "preferences";
pub const WELCOME: &str = "welcome";

/// Logical width of the bar. The renderer drives the height and hardcodes this
/// same width (`src/utils/index.ts`), matching Electron's `setSize(680, h)`.
const BAR_WIDTH: f64 = 680.0;

/// Timestamp (ms since epoch) of the last programmatic `show()`. macOS can
/// deliver a spurious `Focused(false)` between `show()` and `set_focus()`,
/// which would immediately re-hide the bar we just opened.
static LAST_SHOWN_MS: AtomicU64 = AtomicU64::new(0);
// Only read by the hide-on-blur handler, which is compiled out in debug builds.
#[cfg_attr(debug_assertions, allow(dead_code))]
const SHOW_GRACE_MS: u64 = 250;

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

#[cfg_attr(debug_assertions, allow(dead_code))]
pub fn within_show_grace() -> bool {
    now_ms().saturating_sub(LAST_SHOWN_MS.load(Ordering::Relaxed)) < SHOW_GRACE_MS
}

/// Injected before any page script runs, so the renderer can read its settings
/// synchronously at module load the way it did with electron-store's
/// `sendSync` (`src/index.tsx`). plugin-store has no synchronous API.
fn bootstrap_script<R: Runtime>(app: &AppHandle<R>) -> String {
    let payload = serde_json::json!({
        "settings": settings::snapshot(app),
        "platform": std::env::consts::OS,
        "version": app.package_info().version.to_string(),
    });
    format!(
        "window.__TRANSEE__ = {};",
        serde_json::to_string(&payload).unwrap_or_else(|_| "{}".into())
    )
}

/// Builds a window from its declarative `tauri.conf.json` entry, adding the
/// bootstrap script. Every window is declared with `"create": false` so that
/// all four go through here and none of them miss the injection.
pub fn create<R: Runtime>(app: &AppHandle<R>, label: &str) -> Result<WebviewWindow<R>, String> {
    let mut config = app
        .config()
        .app
        .windows
        .iter()
        .find(|w| w.label == label)
        .cloned()
        .ok_or_else(|| format!("no window config for \"{label}\""))?;

    let light = settings::get_string(app, "theme", "dark") == "light";
    config.theme = Some(if light {
        tauri::Theme::Light
    } else {
        tauri::Theme::Dark
    });
    if label != MAIN {
        config.background_color = Some(if light {
            tauri::window::Color(247, 248, 250, 255)
        } else {
            tauri::window::Color(42, 42, 42, 255)
        });
    }

    WebviewWindowBuilder::from_config(app, &config)
        .map_err(|err| err.to_string())?
        .initialization_script(bootstrap_script(app))
        .build()
        .map_err(|err| err.to_string())
}

/// Move to the active Space, reposition, show, and focus on the main thread.
///
/// `set_focus()` is a no-op on a window that is not yet visible (tao guards on
/// `isVisible`), so `show()` must come first. AppKit's Space behavior must be
/// configured before either call activates the window.
pub fn show_bar<R: Runtime>(app: &AppHandle<R>) {
    let Some(window) = app.get_webview_window(MAIN) else {
        return;
    };

    let app = app.clone();
    let bar = window.clone();
    if let Err(err) = window.run_on_main_thread(move || {
        #[cfg(target_os = "macos")]
        if let Err(err) = move_to_active_space(&bar) {
            eprintln!("[transee] failed to configure bar Space behavior: {err}");
        }

        if let Err(err) = reposition(&app, &bar) {
            eprintln!("[transee] failed to reposition bar: {err}");
        }

        LAST_SHOWN_MS.store(now_ms(), Ordering::Relaxed);

        let _ = bar.show();
        let _ = bar.set_focus();
    }) {
        eprintln!("[transee] failed to show bar on the main thread: {err}");
    }
}

/// Bring the resident bar to the active Space when it is activated, instead
/// of returning the user to the Space where the window was first shown.
#[cfg(target_os = "macos")]
fn move_to_active_space<R: Runtime>(window: &WebviewWindow<R>) -> tauri::Result<()> {
    use objc2_app_kit::{NSWindow, NSWindowCollectionBehavior};

    let ns_window = window.ns_window()?.cast::<NSWindow>();
    // SAFETY: show_bar runs this on the main thread, and the live Tauri window
    // owns the NSWindow for the duration of this call.
    let ns_window = unsafe { &*ns_window };
    let mut behavior = ns_window.collectionBehavior();
    behavior.remove(NSWindowCollectionBehavior::CanJoinAllSpaces);
    behavior.insert(NSWindowCollectionBehavior::MoveToActiveSpace);
    ns_window.setCollectionBehavior(behavior);
    Ok(())
}

/// Port of `getWindowPosition` in src/main/windows/bar.ts:13-26.
///
/// The cursor only selects *which* display to use; the bar is then centred
/// horizontally on it and placed at a fixed vertical offset (Spotlight-style,
/// upper third). Electron worked in logical pixels and used `display.bounds`
/// (not `workArea`); Tauri's monitor APIs are physical, so every term is scaled
/// by the *target* monitor's scale factor rather than the window's.
fn reposition<R: Runtime>(app: &AppHandle<R>, window: &WebviewWindow<R>) -> tauri::Result<()> {
    let cursor = app.cursor_position()?;
    let Some(monitor) = app
        .monitor_from_point(cursor.x, cursor.y)?
        .or(app.primary_monitor()?)
    else {
        return Ok(());
    };

    let scale = monitor.scale_factor();
    let origin = *monitor.position();
    let size = *monitor.size();
    let logical_height = size.height as f64 / scale;

    let max_app_height = if logical_height < 768.0 { 768.0 } else { 800.0 };

    let x = origin.x as f64 + (size.width as f64 - BAR_WIDTH * scale) / 2.0;
    let y = origin.y as f64 + (size.height as f64 - max_app_height * scale) / 2.0;

    window.set_position(PhysicalPosition::new(x.round() as i32, y.round() as i32))
}

/// Opens one of the auxiliary windows, focusing it if it already exists.
///
/// Closing one destroys it — matching Electron, where `close` nulled the
/// module-level handle (e.g. src/main/windows/about.ts:22).
pub fn open_singleton<R: Runtime>(app: &AppHandle<R>, label: &str) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(label) {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
        return Ok(());
    }
    create(app, label).map(|_| ())
}
