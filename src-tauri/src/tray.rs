//! Tray icon and its context menu — the port of src/main/menu.ts.

use tauri::{
    menu::{Menu, MenuBuilder, MenuItemBuilder},
    tray::{TrayIcon, TrayIconBuilder},
    AppHandle, Runtime,
};
use tauri_plugin_opener::OpenerExt;

use crate::settings;
use crate::windows::{self, ABOUT, PREFERENCES, WELCOME};

const TRAY_ID: &str = "transee-tray";
const RELEASES_URL: &str = "https://github.com/alessioforte/transee/releases";

pub fn create<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<TrayIcon<R>> {
    // macOS wants a template image so the glyph inverts with the menubar.
    // Unlike Electron, Tauri does not resolve the `@2x` filename convention —
    // it decodes exactly the buffer it is given — so ship the 2x asset and let
    // AppKit downscale, or the icon is blurry on Retina.
    #[cfg(target_os = "macos")]
    let icon = tauri::include_image!("icons/tray-macos.png");
    #[cfg(not(target_os = "macos"))]
    let icon = tauri::include_image!("icons/tray-windows.ico");

    let tray = TrayIconBuilder::with_id(TRAY_ID)
        .icon(icon)
        .tooltip("Transee")
        .menu(&build_menu(app)?)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "about" => open(app, ABOUT),
            "update" => {
                // The Electron auto-updater never worked (the pre-Electron-6
                // showMessageBox callbacks at src/main/updater.ts:28,56 stopped
                // firing years ago, so downloadUpdate was never reached), so
                // this now just opens the releases page.
                let _ = app.opener().open_url(RELEASES_URL, None::<&str>);
            }
            "preferences" => open(app, PREFERENCES),
            "show" => windows::show_bar(app),
            "welcome" => open(app, WELCOME),
            "quit" => app.exit(0),
            _ => {}
        })
        .build(app)?;

    #[cfg(target_os = "macos")]
    let _ = tray.set_icon_as_template(true);

    Ok(tray)
}

/// Rebuilds the menu so the "Show translation bar" accelerator label follows a
/// rebind. Electron built the menu once at tray creation (src/main/menu.ts:22),
/// so the displayed shortcut went stale after changing it in Preferences.
pub fn refresh_menu<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    if let Some(tray) = app.tray_by_id(TRAY_ID) {
        tray.set_menu(Some(build_menu(app)?))?;
    }
    Ok(())
}

fn build_menu<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    let accelerator = settings::get_string(app, "shortcut", settings::DEFAULT_SHORTCUT);

    let mut show = MenuItemBuilder::with_id("show", "Show translation bar");
    // muda parses accelerators with the same grammar as the global-shortcut
    // plugin, so the stored string feeds both. A malformed one would fail the
    // whole menu build, so fall back to a plain label.
    if !accelerator.is_empty() {
        show = show.accelerator(&accelerator);
    }
    let show = match show.build(app) {
        Ok(item) => item,
        Err(_) => MenuItemBuilder::with_id("show", "Show translation bar").build(app)?,
    };

    MenuBuilder::new(app)
        .text("about", "About Transee")
        .text("update", "Check for update")
        .separator()
        .text("preferences", "Preferences...")
        .separator()
        .item(&show)
        .separator()
        .text("welcome", "Welcome Guide")
        .separator()
        .text("quit", "Quit")
        .build()
}

fn open<R: Runtime>(app: &AppHandle<R>, label: &str) {
    if let Err(err) = windows::open_singleton(app, label) {
        eprintln!("[transee] failed to open {label}: {err}");
    }
}
