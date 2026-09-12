mod settings;
mod shortcut;
mod translate;
mod tray;
mod windows;

use tauri::{AppHandle, Manager, RunEvent, WindowEvent};

/// Rebinds the global shortcut from the Preferences UI and refreshes the tray
/// menu label. Replaces the `change-shortcut` IPC channel.
#[tauri::command]
fn set_shortcut(app: AppHandle, accelerator: String) -> Result<(), String> {
    shortcut::register(&app, &accelerator)?;
    settings::set(&app, "shortcut", serde_json::json!(accelerator));
    tray::refresh_menu(&app).map_err(|err| err.to_string())
}

/// Replaces the `restore-settings` IPC channel. Electron called
/// `app.relaunch()` without a following `exit()` (src/main/main.ts:107), so the
/// advertised restart never actually happened; `app.restart()` does.
#[tauri::command]
fn restore_settings(app: AppHandle) -> Result<(), String> {
    settings::restore_defaults(&app).map_err(|err| err.to_string())?;
    app.restart();
}

#[tauri::command]
fn open_devtools(_window: tauri::WebviewWindow) {
    #[cfg(debug_assertions)]
    _window.open_devtools();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    // The single-instance plugin must be registered before every other plugin.
    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
                windows::show_bar(app);
            }))
            .plugin(
                tauri_plugin_global_shortcut::Builder::new()
                    .with_handler(shortcut::on_shortcut)
                    .build(),
            )
            .plugin(tauri_plugin_autostart::init(
                tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                None,
            ));
    }

    builder
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            set_shortcut,
            restore_settings,
            open_devtools,
            translate::google_batchexecute,
        ])
        .setup(|app| {
            let handle = app.handle().clone();

            // Menubar app: no Dock icon, no app-switcher entry. Info.plist
            // already sets LSUIElement so there is no flash before this runs.
            //
            // NOTE: enable_macos_default_menu is left at its default (true) on
            // purpose — Cmd+C/V/X/A inside the translation textarea are
            // dispatched through the app's main menu, and disabling it (a
            // common menubar-app step) kills clipboard shortcuts silently.
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            app.manage(translate::Http::new()?);

            settings::init(&handle)?;

            let accelerator = settings::get_string(
                &handle,
                "shortcut",
                settings::DEFAULT_SHORTCUT,
            );
            if let Err(err) = shortcut::register(&handle, &accelerator) {
                // Unlike Electron, which ignored the boolean return, a clash is
                // at least visible here.
                eprintln!("[transee] {err}");
            }

            tray::create(&handle)?;

            // Resident but hidden, shown by the shortcut or the tray.
            windows::create(&handle, windows::MAIN)?;

            // The Electron dev build opened all four windows at startup
            // (src/main/main.ts:33-38), which is the only way to see the
            // auxiliary ones without going through the tray. Kept, but opt-in.
            #[cfg(debug_assertions)]
            if std::env::var("TRANSEE_DEV_WINDOWS").is_ok() {
                for label in [windows::ABOUT, windows::PREFERENCES, windows::WELCOME] {
                    let _ = windows::open_singleton(&handle, label);
                }
                windows::show_bar(&handle);
            }

            let show_welcome = settings::get_bool(&handle, "showWelcome", true);
            if show_welcome {
                windows::open_singleton(&handle, windows::WELCOME)?;
                // Give the guide a Dock presence for as long as it is open,
                // mirroring src/main/main.ts:76-79.
                #[cfg(target_os = "macos")]
                let _ = handle.set_dock_visibility(true);
            }

            Ok(())
        })
        .on_window_event(|window, event| match event {
            // Hide-on-blur, the port of src/main/windows/bar.ts:56-60.
            WindowEvent::Focused(false) if window.label() == windows::MAIN => {
                // Skipped in debug builds so opening devtools (which blurs the
                // window) does not make the bar vanish, matching the `isDev`
                // guard the Electron build had.
                #[cfg(not(debug_assertions))]
                if !windows::within_show_grace() {
                    let _ = window.hide();
                }
            }
            // The macOS default menu binds Cmd+W to Close Window, which would
            // destroy the resident bar. Hide it instead.
            WindowEvent::CloseRequested { api, .. } if window.label() == windows::MAIN => {
                api.prevent_close();
                let _ = window.hide();
            }
            WindowEvent::Destroyed if window.label() == windows::WELCOME => {
                #[cfg(target_os = "macos")]
                let _ = window.app_handle().set_dock_visibility(false);
            }
            _ => {}
        })
        .build(tauri::generate_context!())
        .expect("error while building Transee")
        .run(|_app, event| {
            // Closing the last window must not quit a tray app. `code: None`
            // means the exit came from user interaction rather than app.exit().
            if let RunEvent::ExitRequested { code: None, api, .. } = event {
                api.prevent_exit();
            }
        });
}
