# Transee: Electron → Tauri 2 migration + React restructure

## Context

Transee is a 2.1.0 macOS/Windows menubar translation app (~4.3k LOC) built on the
electron-react-boilerplate scaffold. It has gone stale: Electron 30 + seven webpack
configs + a DLL prebundle step, React 18 with `@types/react@17`, styled-components 5,
Jest wired to a path that doesn't exist, and six declared dependencies that are never
imported (`electron-request`, `electron-log`, `electron-debug`,
`electron-devtools-installer`, `electron-rebuild`, `history`).

The goal is to replace the Electron shell with Tauri 2 and restructure the React code,
**keeping the UI pixel-identical**.

Decisions taken up front:

|                |                                                                            |
| -------------- | -------------------------------------------------------------------------- |
| Platforms      | macOS + Windows (same as today)                                            |
| Sequencing     | Port first, then refactor — two independently verifiable phases            |
| Auto-updater   | **Dropped**                                                                |
| Frontend stack | Vite + React 19 + **CSS Modules** (styled-components removed) — in phase 2 |

Three things found during exploration that shape the plan:

- **The updater never worked.** `src/main/updater.ts:28,56` uses the pre-Electron-6
  callback form of `dialog.showMessageBox(options, cb)`; since Electron 6 that returns a
  Promise and ignores the callback, so `downloadUpdate()` and `quitAndInstall()` have
  never been reached. Dropping it removes no working functionality.
- **Failed requests hang the UI forever.** `src/main/preload.ts:3-10` whitelists
  `'response'` but not `'error'`, so the subscription at `src/renderer/store/index.tsx:204`
  is silently discarded, and `loading` is only cleared inside the `response` handler
  (`:201`). Offline → spinner forever. The port fixes this structurally.
- **The local Tauri CLI is 2.10.1 and needs to be 2.11.x.** The drag-region semantics
  this app depends on (§1.3c) landed in core 2.11.0.

Toolchain is otherwise ready: rustc 1.98, cargo 1.98, Node 22.18, Xcode installed.

---

## Phase 0 — Baseline (the only safety net; there are no tests)

1. Build and run the current Electron app; screenshot all four windows at their exact
   sizes (bar 680×85 collapsed **and** expanded with results, About 520×253,
   Preferences 420×430, Welcome 520×430 at every carousel step). These are the reference
   images for the whole migration.
2. Dump a real Google `batchexecute` response body for each of the three operations
   (`translation`, `hints`, `voice`) from `src/main/main.ts:126` into `fixtures/`. They
   become parser test inputs and let you work offline.
3. Write Vitest tests against **current** behaviour for the pure functions, so they act as
   a contract across both phases: `containers/LangsBar/actions.ts` `selectLangs` /
   `invertLangs`, `utils/mapping.ts`, `utils/index.ts` `validateInput`, and `parser()`
   (`store/index.tsx:149-159`) against the fixtures.
4. Commit or stash the current working-tree changes (`LICENSE`, `package.json`,
   `package-lock.json`, `src/main/windows/bar.ts`, `src/renderer/store/index.tsx`).
5. Work on a branch and keep `src/main/` in the tree until Phase 1 is verified, so you can
   A/B the two builds.

**Then, before porting any real code, spike the one genuine unknown** (§1.3a): a bare
Tauri app with a tray, `ActivationPolicy::Accessory`, a global shortcut, and an
autofocused text input. Confirm you can hit the hotkey and type immediately, and that
Cmd+V works in the input.

---

## Phase 1 — Swap the shell, renderer barely touched

React stays on 18 and styled-components on 5 here — both work under Vite. React 19 + CSS
Modules is Phase 2. The point is that any UI regression is unambiguously the shell's fault.

### 1.1 Target layout

```
transee/
  index.html                  # from src/renderer/index.ejs; ?query routing kept
  vite.config.ts
  src/                        # was src/renderer/ (git mv, keeps history)
  src-tauri/
    Cargo.toml  tauri.conf.json  build.rs  Info.plist
    capabilities/default.json
    icons/
    src/ main.rs lib.rs windows.rs tray.rs shortcut.rs settings.rs translate.rs
```

`src/main/`, `.erb/`, `release/`, `jest.config.js`, `test-node.js`, `publish.sh` are
deleted at the end of the phase.

### 1.2 Dependency mapping

| Electron                                                             | Tauri 2                                                                                                                                         |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 4 `BrowserWindow`s on `index.html?main\|about\|welcome\|preferences` | 4 windows in `tauri.conf.json`; aux ones `"create": false` + `WebviewWindowBuilder::from_config`, singleton via `app.get_webview_window(label)` |
| `app.dock.hide()`                                                    | `set_activation_policy(Accessory)` + `set_dock_visibility(false)`                                                                               |
| `globalShortcut`                                                     | `tauri-plugin-global-shortcut` 2.3.2 — **driven from Rust**                                                                                     |
| `Tray` + `Menu`                                                      | `TrayIconBuilder` + `MenuBuilder`                                                                                                               |
| `electron-store`                                                     | `tauri-plugin-store` 2.4.4                                                                                                                      |
| `setLoginItemSettings`                                               | `tauri-plugin-autostart` 2.5.1                                                                                                                  |
| `shell.openExternal`                                                 | `tauri-plugin-opener` 2.5.5 (`tauri-plugin-shell`'s `open` is deprecated)                                                                       |
| `requestSingleInstanceLock`                                          | `tauri-plugin-single-instance` 2.4.4 — **must be registered first**                                                                             |
| `app.quit()`                                                         | `app.exit(0)` — no `tauri-plugin-process` needed                                                                                                |
| `navigator.platform` sniffing (`utils/index.ts:11-22`)               | `std::env::consts::OS` at startup — no `tauri-plugin-os` needed                                                                                 |
| axios proxy (`main.ts:123-130`)                                      | one `#[tauri::command]` over `reqwest` 0.13 (rustls)                                                                                            |
| `electron-updater`                                                   | _removed_; tray "Check for update" opens the GitHub releases page                                                                               |

`tauri = { version = "2.11", features = ["tray-icon", "image-png", "image-ico"] }` —
`tray-icon` is **not** a default feature, and `include_image!` needs the image features.

### 1.3 The five details that will silently break

**(a) Focus after the global shortcut — resolved, but order matters.** `set_focus()`
no-ops if the window is not visible, so it must be `show()` **then** `set_focus()`, both
issued from the same thread. Under the hood tao calls
`makeKeyAndOrderFront` + `activateIgnoringOtherApps:`, which is exactly what an Accessory
app needs — so a plain window works and **`tauri-nspanel` is not required**. Two
corollaries:

- **Do not call `.enable_macos_default_menu(false)`.** It is on by default, and Cmd+C /
  Cmd+V / Cmd+X / Cmd+A in the textarea are dispatched through the app's main menu.
  Disabling it (a common "menubar app" step) kills clipboard shortcuts silently.
- Leaving it on means Cmd+W is bound to Close Window, which would _destroy_ the singleton
  bar. Intercept `WindowEvent::CloseRequested` → `api.prevent_close()` + `win.hide()`.

**(b) Monitor math is in PHYSICAL pixels.** `cursor_position()`, `Monitor::position()`,
`Monitor::size()` all return physical pixels; the Electron code works in logical/DIP. A
straight port puts the bar half off-screen on Retina. Port `getWindowPosition`
(`bar.ts:13-26`) with its exact arithmetic — note `y` does **not** depend on the window
height:

```
maxAppHeight = displayHeight < 768 ? 768 : 800
x = displayX + (displayWidth - 680) / 2
y = displayY + (displayHeight - maxAppHeight) / 2
```

…with every term converted via the _target_ monitor's `scale_factor()`. Use
`monitor_from_point(cursor.x, cursor.y)` (which correctly takes physical coords), fall
back to `primary_monitor()`, and use `.size()` not `.work_area()` to match Electron's use
of `display.bounds`. Do this in Rust, not JS — from JS it costs two IPC round-trips before
the window is even shown. When both position and size change, **set position first**:
`set_size(LogicalSize)` uses the window's _current_ scale factor, which is wrong mid-move
across a DPI boundary.

**(c) Drag regions — child behaviour is the inverse of Electron.**
`-webkit-app-region: drag` does nothing in WKWebView or WebView2. The replacement is
`data-tauri-drag-region`, which by default applies **only to the element it is on, with no
inheritance** — a naive port leaves the bar undraggable the moment the pointer is over an
inner wrapper. Tauri core 2.11.0 added `data-tauri-drag-region="deep"` (propagates to
non-clickable descendants, auto-excludes interactive elements) and `="false"` (opt-out),
which maps the existing CSS almost 1:1: `containers/Layout/index.tsx:40` and
`LangsBar/index.tsx:179` become `"deep"`, and the `no-drag` escapes at
`LangsBar/index.tsx:152,162,190` become `"false"`. Set `resizable: false` **and**
`maximizable: false` on the bar to suppress double-click-to-maximize; if it still leaks,
fall back to a `mousedown` handler calling `startDragging()`.

**(d) The request body encoding.** The body is
`f.req=${encodeURI(JSON.stringify(data))}` (`services/api.ts:20-25,39-44,58-63`).
`encodeURI` leaves `;,/?:@&=+$-_.!~*'()#` unescaped and **no Rust crate reproduces that
set** — `percent_encoding`'s presets all differ and `form_urlencoded` escapes far more.
**Build the body string in TypeScript and pass it to Rust as an opaque `String`.** Then on
the Rust side: use `.body(string)` (never `.form()`, which re-encodes), set
`Content-Type` manually, set a browser `User-Agent` (reqwest sends none by default and
batchexecute rejects that), use `redirect::Policy::none()` (reqwest otherwise follows a
302 to a consent page, drops the POST body, and hands your parser HTML), and build **one**
`reqwest::Client` into managed state since translate/suggest fire per keystroke.

One command with an operation discriminator beats three near-identical ones. The `)]}'`
prefix passes through untouched, so the existing `parser()` is unchanged.

**(e) CSP will silently break styled-components.** Tauri injects a nonce into `style-src`,
and per CSP3 **any nonce in a directive causes `'unsafe-inline'` to be ignored**. Adding
`'unsafe-inline'` alone is not enough — Phase 1 also needs
`"dangerousDisableAssetCspModification": ["style-src"]`. Set `devCsp` explicitly (Vite's
HMR needs `ws://localhost:1420` and an inline preamble). Note `connect-src` needs
`ipc: http://ipc.localhost` but **not** Google, since all HTTP is in Rust. React's
`style={{…}}` prop goes through the CSSOM and is not CSP-governed, so dynamic inline
styles need nothing. **Phase 2 deletes both the override and `'unsafe-inline'`** once CSS
Modules produce static stylesheets — a real security win.

### 1.4 Settings, migration, and the synchronous read

7 flat keys: `platform`, `version`, `startAtLogin`, `shortcut`, `checkUpdates`,
`showWelcome`, `langs`. `tauri-plugin-store` resolves to `BaseDirectory::AppData` →
`~/Library/Application Support/com.alessioforte.transee/settings.json` (macOS) and
`%APPDATA%\com.alessioforte.transee\settings.json` (Windows). Existing users' data is
under `…/Transee/config.json` (electron-store names the directory from `productName`).
Migrate in Rust `setup()` **before any window loads**, guarded on a `schemaVersion` key
rather than file existence.

Do **not** port `main.ts:43-47`, which calls `store.clear()` on every version change and
wipes the user's saved languages on each update.

The renderer reads settings **synchronously at module load**
(`src/renderer/index.tsx:13-16`, `sendSync`) and plugin-store is async-only. For Phase 1,
keep the renderer unchanged by injecting settings from Rust:
`WebviewWindowBuilder::initialization_script(format!("window.__TRANSEE_SETTINGS__ = {};", …))`
runs before page scripts, so `index.tsx` just reads a global. Writes go through the async
plugin. Phase 2 replaces this with a proper async bootstrap.

### 1.5 Global shortcut

The accelerator strings the app already generates (`RecordShortcut/index.tsx:44-56`:
`Shift+`/`Ctrl+`/`Alt+`/`Cmd+` + a char from `String.fromCharCode`, so only A–Z and 0–9)
**parse unchanged** by `global-hotkey` — `CTRL`, `ALT`, `CMD`, `SHIFT` and single letters
are all accepted tokens. No translation layer is needed for what the UI can currently
produce; add one only if you widen the recorder (`Return`→`Enter`, `Plus`→`Equal`,
`Meta`→`Super`, `AltGr` unsupported).

Two real differences from Electron:

- **`ShortcutState` has `Pressed` and `Released` and you receive both** — an unfiltered
  handler fires the show-bar logic twice per keypress. Filter on `Pressed`.
- **Registration failure is reported** (`register()` returns `Result`, plus
  `is_registered()`), unlike Electron's ignored boolean at `main.ts:56`. Surface conflicts
  in the Preferences UI instead of failing silently.

Registering from Rust means **zero `global-shortcut:*` capabilities** are needed.

### 1.6 Tray, dock, lifecycle

- `.icon_as_template(true)` keeps `iconTemplate.png` inverting with the menubar. But Tauri
  has **no `@2x` filename resolution** — ship only `iconTemplate@2x.png` and let AppKit
  downscale, or the icon is blurry on Retina.
- `.menu_on_left_click()` is deprecated → `.show_menu_on_left_click(bool)`; the default
  `true` already matches Electron's `setContextMenu`.
- macOS tray menu items **do** render accelerator labels (muda sets `keyEquivalent`), and
  muda's accelerator grammar is the same as global-hotkey's — feed it the same string from
  the store. Unlike today, rebuild the menu when the shortcut changes (`menu.ts:22-39`
  builds it once, so the displayed accelerator goes stale).
- Dock: `set_activation_policy(Accessory)` + `set_dock_visibility(false)`, plus
  `LSUIElement` in `src-tauri/Info.plist` so there's no dock-icon flash at launch. For the
  first-run Welcome window use `set_dock_visibility(true)` rather than flipping the policy
  to `Regular` — policy round-trips are a known source of activation weirdness.
- Hide-on-blur is `WindowEvent::Focused(false)` → `win.hide()` (never `app.hide()`). Guard
  against a spurious blur landing between `show()` and `set_focus()` with a "just shown"
  timestamp (~150 ms), and gate the handler off in debug builds or opening devtools hides
  the window.
- Add `RunEvent::ExitRequested { code: None, api, .. } → api.prevent_exit()` so hiding the
  last window doesn't quit on Windows.
- **autostart caveat**: `MacosLauncher::LaunchAgent` writes a plist that appears under
  System Settings → General → Login Items → **"Allow in the Background"**, not under "Open
  at Login" where Electron put it. Adjust the Preferences copy. The plist embeds the binary
  path, so never enable it in `tauri dev`.

### 1.7 Capabilities

Custom `#[tauri::command]`s need **no permission** — the ACL only governs `core:*` and
plugin commands. Most window getters are already in `core:default`; these eight are not
and must be added explicitly: `core:window:allow-show`, `allow-hide`, `allow-set-size`,
`allow-set-position`, `allow-set-focus`, `allow-start-dragging`, `allow-close`,
`allow-center` — plus `store:default`, `opener:default` (scoped to `https://*`) and
`autostart:default`. Creating the aux windows in Rust avoids needing
`core:webview:allow-create-webview-window`.

### 1.8 Renderer changes in Phase 1 — keep this list short

Only what the shell swap forces:

- `src/platform/` — a thin adapter (`settings.ts`, `window.ts`, `translate.ts`,
  `autostart.ts`, `opener.ts`) that is the **only** place importing `@tauri-apps/*`. All
  19 current `window.electron.*` / `ipcRenderer.*` call sites point here.
- The `window-height` channel becomes a direct
  `getCurrentWindow().setSize(new LogicalSize(680, h))` from JS — keep the ≥81 clamp and
  the hardcoded 680 from `utils/index.ts:2-9` exactly. Add a small threshold/debounce so
  the measure→resize→relayout loop can't oscillate.
- `hide-window` → `getCurrentWindow().hide()`.
- `data-tauri-drag-region` (§1.3c) and `initialization_script` settings read (§1.4).
- `isMac`/`isWin` from the injected platform value instead of `navigator`.
- `services/api.ts` builds the body string and calls `invoke`; `parser()` and `mapping()`
  stay untouched so response handling is provably identical.
- Delete the dead Reverso code (`services/api.ts:89,106`, `services/index.ts`) — it is
  unreachable (`reversoEnabled: false`) and is the only reason `axios` is a dependency.
- `vite.config.ts` needs `clearScreen: false`, `server.strictPort`, port matching
  `devUrl`, `server.watch.ignored: ['**/src-tauri/**']`, and
  `build.target: TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari14'`. Do **not**
  set a custom `base`. Keep the single `index.html?query` entry — the aux windows then
  open instantly from webview cache. The `assets/fonts/` files must move under the Vite
  tree to be emitted at all.

**Exit criteria:** all four windows match the Phase 0 screenshots; the manual checklist
passes; the Electron tree is deleted.

---

## Phase 2 — React 19, CSS Modules, and code structure

### 2.1 styled-components → CSS Modules

The largest single piece: 16 files declare styled-components at the bottom, below their
default export.

1. **Tokens → CSS custom properties.** `theme/index.ts` is a plain object (24 colour
   tokens + 16 `colors.text` tokens + a shadow) with no `ThemeProvider` anywhere — every
   file just does `const { colors } = theme`. It becomes `shared/styles/tokens.css`.
2. **`getColorLuminance` is called at module-eval time with static inputs** (6 sites:
   `App:298,302`, `About:105`, `Preferences:159,162`, `LangsBar:204`, `Icon:47`). Run it
   once via a throwaway script, paste the resulting hex values in as extra custom
   properties, delete the function. Exact parity beats elegance here.
3. **Boolean style props → `data-*` attributes** (`active`, `hover`, `isOpen`, `inBar`,
   `status`, `noBorder`, `value`) with CSS attribute selectors. This also removes the
   unknown-prop-to-DOM warnings styled-components 5 currently produces.
4. **Genuinely dynamic values → inline `style` with CSS variables** (e.g. the `Frequency`
   bars, `StickyCards/index.tsx:215-228`). Not CSP-governed — see §1.3e.
5. `createGlobalStyle` → `global.css`; `keyframes` (`Tooltip:111-121`) → `@keyframes`
   inside the module (CSS Modules scopes animation names); the `css` helper map
   (`RecordShortcut:124-137`) → a `data-status` selector block.
6. Extract the near-duplicate `Container`/`Loading`/`Icons`/`Message` blocks shared by
   `Searchbar/index.tsx:164-218` and `Textarea/index.tsx:50-88`.
7. Drop `dangerousDisableAssetCspModification` and `'unsafe-inline'` from the CSP.

**Decide deliberately:** `assets/fonts/*.woff2` (14 Nunito files) ship but there is no
`@font-face` rule anywhere in `src/`, so the app renders in Nunito only if the OS happens
to have it. Either add the rule (which _changes_ the UI on machines without Nunito) or
delete the files. Don't leave it accidental.

### 2.2 Store split

Today: one 206-line zustand store, one `useStore()` call with no selector
(`index.tsx:37`), the whole object drilled as a single `store` prop into all four windows
and into `useWindowKeyDown`. Every state change re-renders the entire active window; there
is no `React.memo` or `useMemo` anywhere.

- `stores/settings.ts` — `shortcut`, `startAtLogin`, `checkUpdates`, `showWelcome`,
  `langs`; persisted through the `platform/settings` adapter, no IPC inline.
- `stores/translation.ts` — `input`, `search`, `payload`, `suggestions`, `google`,
  `loading`, `error`, `speed`.
- Components subscribe with **selectors** instead of receiving a `store` prop.
- Replace the `initialization_script` hack with a proper async bootstrap.

Move out of the store: `parser()` (`:149-159`), the payload heuristics (`:173-183`) and
`mapping()` into `services/google/`; the `AudioContext` playback (`:190-196`) into
`services/audio.ts`. Delete the module-level IPC listeners at `:161-207` — they attach in
_every_ window (About, Preferences and Welcome all subscribe to translation responses) and
are never unsubscribed.

### 2.3 Correctness fixes the restructure should pick up

Ordered by user impact:

1. **Stale responses.** Requests are correlated only by an `operation` string, so a slow
   translation overwrites a newer one. Awaited `invoke` + a request-generation counter.
2. **`loading` semantics.** One global boolean set in `getData` (`:55`) and cleared by
   _any_ response (`:201`) — a `hints` response clears the spinner while the translation
   is still in flight. Make it per-operation.
3. **Toggles don't reset.** `Toggle/index.tsx:34` and `Checkbox/index.tsx:19` copy
   `initialValue` into local state with no sync effect, so after "Restore default
   settings" (`Preferences:105`) the switches keep their old positions. Make them
   controlled.
4. **`window.onkeydown` assigned during render** (`useWindowKeyDown.ts:19`), no cleanup,
   `useCallback` keyed on an object that changes identity every update → `useEffect` +
   `addEventListener`/`removeEventListener`. Same for `document.body.onfocus`
   (`Searchbar/index.tsx:37-39`). React 19's stricter effect semantics make these worse.
5. **`useDropdown` leaks listeners.** `close` is recreated each render, so
   `removeEventListener('click', close)` (`:30-31`) removes a different function identity
   than `show()` registered. Its `dropdown` ref param is accepted and ignored, which is
   why `LangsBar:61` needs a `stopPropagation` workaround.
6. **`RecordShortcut` leaks `document` listeners** if the window closes mid-recording
   (`:36-37` vs `:75-76,96-97`), uses deprecated `e.keyCode`, and maps without a `key`.
7. **`Tooltip` has a `useEffect` with no dependency array** calling
   `getBoundingClientRect()` and `Object.assign`ing inline styles every render.
8. Arrow-key suggestion cycling restarts the 900 ms debounce and fires a new translate
   request **per keypress** (`Searchbar:80-99` → `:62-71`).
9. The Welcome guide advertises `Alt+Shift` for "Invert languages" (`Welcome:127`) but the
   implementation is `Ctrl+I` (`useWindowKeyDown.ts:34`). Pick one.

### 2.4 Structure

```
src/
  app/          per-window entries
  features/     translation/ · settings/ · onboarding/ · about/
  shared/       ui/ · hooks/ · styles/
  platform/     Tauri adapter (from Phase 1)
  services/     google/{client,parse,map}.ts · audio.ts
  stores/       settings.ts · translation.ts
```

Also here: type the 8 remaining `any`s in `interfaces/index.ts:21-58`; unify the three
competing `Langs` types (`services/interfaces.ts:1-4`, `interfaces/index.ts:11-17`,
`containers/LangsBar/interfaces.ts:8-11`); delete the duplicated default-langs literal
(`store/index.tsx:13-27` ↔ `LangsBar/index.tsx:16-30`), the dead `reverso*` state,
`setError`/`setLoading`/`setSearch`/`setGoogle` (never called), the empty
`windows/App/interfaces.ts`, and the ~70 lines of commented-out blocks in `Preferences`
and `App`. Optionally split into four Vite entries so each window stops loading all four
screens plus the 231-line language table — but only if the instant-open benefit of the
shared bundle turns out not to matter.

---

## Verification

**Automated:** the Phase 0 Vitest suite must still pass unchanged at the end of both
phases. Plus `tsc --noEmit`, `cargo clippy`, `cargo test`.

**Manual checklist** — run against both builds side by side at the end of Phase 1, and
again at the end of Phase 2:

1. Global shortcut shows the bar, centred on the display holding the cursor, at the
   Spotlight-style vertical offset — **and you can type immediately without clicking**.
2. Cmd+C / Cmd+V / Cmd+A work inside the textarea; Cmd+W hides the bar rather than
   destroying it.
3. Clicking away hides the bar. `Escape` clears suggestions if open, otherwise hides.
4. Typing grows the textarea and the window grows with it; clearing shrinks back to 85.
5. `Tab` accepts the first suggestion; arrows cycle; `Ctrl+I` inverts and re-translates;
   `Ctrl+P` / `Ctrl+Alt+P` speak source and translation.
6. Tray menu opens About / Preferences / Welcome, each a singleton that refocuses rather
   than opening a second window; the "Show translation bar" accelerator label is correct
   **and updates after a rebind**; Quit works.
7. Preferences: recording a new shortcut rebinds immediately and survives a restart; a
   conflicting shortcut reports failure instead of silently doing nothing; start-at-login
   toggles for real; restore-defaults resets the UI **and** the toggle positions.
8. Dock icon hidden except during first-run Welcome, with no flash at launch.
9. Offline: the spinner stops and an error shows (a fix, not parity).
10. Settings written by the old Electron build survive first launch of the Tauri build.
11. Multi-monitor: hotkey on a Retina display and on a 1x external — bar lands correctly
    on both, including a display positioned left of the primary (negative coordinates).
12. Windows: tray `.ico`, the win32 title-bar branch in `Layout`, the Windows-only
    scrollbar styling in `GlobalStyle.ts:36`, the `taskbar.png` Welcome screenshot, and a
    hide→show→hide cycle (historical blur-event bug on Windows 11).

**Packaging:** `tauri build --target universal-apple-darwin --bundles app,dmg` (needs both
rustup targets) and `--bundles nsis` on Windows with `installMode: "currentUser"`.
`LSUIElement` goes in `src-tauri/Info.plist` — `bundle.macOS.infoPlist` is a _path_, not a
dict, contrary to most blog posts. macOS category is top-level `bundle.category`. Bump
`minimumSystemVersion` to `"11.0"`. Notarization is native to `tauri build` via
`APPLE_SIGNING_IDENTITY` + either `APPLE_API_ISSUER`/`APPLE_API_KEY`/`APPLE_API_KEY_PATH`
(preferred) or `APPLE_ID`/`APPLE_PASSWORD`/`APPLE_TEAM_ID`. Verify the app launches from
`/Applications` with no Dock icon and the tray icon inverts in both light and dark menubars.

---

## Remaining risk

The Phase 0 spike settles the focus question. The residual unknown is that
`activateIgnoringOtherApps:` is deprecated as of macOS 14 and Apple has been tightening
cross-app activation. An app responding to its own registered hotkey is activation-eligible
and this is the same path Electron takes, so it is behaviour-preserving — but test on the
newest macOS you have before committing to the plain-window approach. The contingency is
`tauri-nspanel`, which is git-only (not on crates.io), pinned to an unversioned branch of a
single-maintainer repo, and whose non-activating panel may itself break the main-menu
clipboard shortcuts. Treat it as a last resort, not a default.
