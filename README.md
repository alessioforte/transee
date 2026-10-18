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

Before building a universal macOS app, install both Rust targets:

```bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin
```

```bash
npm run package                                    # host architecture
npm run package -- --target universal-apple-darwin # universal macOS build
```

Output lands in `src-tauri/target/release/bundle/`, or
`src-tauri/target/universal-apple-darwin/release/bundle/` for universal macOS
builds. macOS signing and
notarization are driven by the usual environment variables
(`APPLE_SIGNING_IDENTITY`, plus either `APPLE_API_*` or
`APPLE_ID`/`APPLE_PASSWORD`/`APPLE_TEAM_ID`); Tauri notarizes as part of the
build when they are set.

### Layout

```
index.html                 single entry; the window is picked by query string
src/
  app/                     bootstrap + the ?main|?about|… → component map
  features/
    translation/           the bar: LangsBar, Searchbar, Textarea, StickyCards
    settings/              Preferences window + the shortcut recorder
    onboarding/            Welcome guide
    about/
  shared/
    ui/                    generic presentational components + window Layout
    hooks/  styles/        useDropdown; tokens.css + global.css
    color.ts dom.ts validate.ts
  platform/                the ONLY module importing @tauri-apps/*
  services/                google/{client,parse} and audio — no React, no shell
  stores/                  zustand: settings (persisted), translation (ephemeral)
  types/                   shared type definitions
src-tauri/                 Rust shell: tray, global shortcut, window positioning,
                           settings, and the Google Translate request
baseline/                  reference screenshots of the old Electron build
fixtures/                  recorded Google batchexecute responses used by tests
```

Imports use the `@/` (src) and `@assets/` aliases rather than relative paths, so
moving a file does not cascade.

Styling is CSS Modules over the custom properties in
`src/shared/styles/tokens.css`. There is no runtime styling library; a test
re-derives the handful of tinted tokens so they cannot drift from the palette.

### Settings

Stored at `~/Library/Application Support/com.alessioforte.transee/settings.json`
(macOS) or `%APPDATA%\com.alessioforte.transee\settings.json` (Windows).
Settings written by the previous Electron build (`.../Transee/config.json`) are
imported automatically on first launch.
