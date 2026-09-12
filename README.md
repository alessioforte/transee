<div align="center">

![Transee](https://alessioforte.github.io/transee/static/icon_256x256.png)

# Transee
Simple and useful tool for quick translation - reference to Google Translate

![screenshot](https://alessioforte.github.io/transee/static/rainbow.png)

</div>

A macOS/Windows menubar app. Hit the global shortcut (`Ctrl+Alt+T` by default),
type, get a translation. Built with [Tauri 2](https://v2.tauri.app), React and
TypeScript.

### Requirements

- Node 20+
- [Rust](https://rustup.rs) stable
- macOS: Xcode command line tools · Windows: the MSVC toolchain + WebView2

### Development

```bash
npm install
npm start          # tauri dev
```

`TRANSEE_DEV_WINDOWS=1 npm start` also opens the About / Preferences / Welcome
windows at launch, which is otherwise only possible through the tray menu.

Note that hide-on-blur is compiled out of debug builds, so the bar stays put
while you have devtools open.

```bash
npm test           # vitest
npm run typecheck  # tsc --noEmit
```

### Packaging

```bash
npm run package                                    # host architecture
npm run package -- --target universal-apple-darwin # universal macOS build
```

Output lands in `src-tauri/target/release/bundle/`. macOS signing and
notarization are driven by the usual environment variables
(`APPLE_SIGNING_IDENTITY`, plus either `APPLE_API_*` or
`APPLE_ID`/`APPLE_PASSWORD`/`APPLE_TEAM_ID`); Tauri notarizes as part of the
build when they are set.

### Layout

```
index.html        single entry; the window is chosen by query string (?main, ?about, …)
src/              React frontend
  platform/       the only module that imports @tauri-apps/* — everything the
                  UI needs from the shell goes through it
src-tauri/        Rust shell: tray, global shortcut, window positioning,
                  settings, and the Google Translate request
baseline/         reference screenshots of the old Electron build
fixtures/         recorded Google batchexecute responses used by the tests
```

### Settings

Stored at `~/Library/Application Support/com.alessioforte.transee/settings.json`
(macOS) or `%APPDATA%\com.alessioforte.transee\settings.json` (Windows).
Settings written by the previous Electron build (`.../Transee/config.json`) are
imported automatically on first launch.
