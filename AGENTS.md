# Working on Transee

These instructions apply to the entire repository.

## Project

Transee is a macOS/Windows menubar translation app built with Tauri 2, React 19,
TypeScript, Vite, Zustand, and CSS Modules. The default global shortcut is
`Ctrl+Alt+T`. Keep the app lightweight and preserve its existing appearance and
desktop behavior unless the task explicitly changes them.

Read `README.md` for setup and packaging. `plan.md` is historical Electron-to-
Tauri migration context; some paths and assumptions there are obsolete. Use
the current code and manifests as the source of truth.

## Architecture

| Location | Responsibility |
| --- | --- |
| `src/app/` | React entry point; query-string selection of `main`, `about`, `preferences`, or `welcome`. |
| `src/features/` | Translation, settings, onboarding, and about-window UI. |
| `src/shared/` | Reusable UI, hooks, styles, and pure utilities. |
| `src/platform/` | Frontend boundary for Tauri APIs and native commands. |
| `src/services/` | Google RPC client/parsers and audio; independent of React. |
| `src/stores/` | Zustand stores: persisted settings and ephemeral translation state. |
| `src/types/` | Shared TypeScript types, including language selections. |
| `src-tauri/src/` | Rust shell: windows, tray, shortcuts, settings, and HTTP transport. |
| `src/tests/` | Vitest tests running in jsdom. |
| `fixtures/` | Recorded Google responses for offline parser tests. |
| `baseline/` | Reference screenshots and their dimensions. |

Keep `@tauri-apps/*` imports inside `src/platform/`. UI and services access
native functionality through this boundary. Add native commands in Rust and
register them in `src-tauri/src/lib.rs`.

## Development commands

Run JavaScript commands from the repository root. Use Node 20+ and stable Rust;
macOS also needs Xcode command-line tools, and Windows needs MSVC and WebView2.

```sh
npm ci                         # install dependencies from the lockfile
npm start                      # full Tauri app with the Vite dev server
TRANSEE_DEV_WINDOWS=1 npm start # also open auxiliary windows; POSIX shell syntax
npm run typecheck              # strict TypeScript validation
npm test                       # offline Vitest suite
npm run build                  # TypeScript check and production frontend build
```

`npm run dev` starts only Vite. Use `npm start` to exercise the injected settings,
native commands, tray, shortcuts, and window behavior.

For native changes:

```sh
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo check --release --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
```

Run checks appropriate to the change. Use the release check when changing
behavior gated by `debug_assertions`. Format changed Rust files with `rustfmt`
using edition 2021. `npm run lint` currently references ESLint without a declared
ESLint dependency or configuration; use typechecking and tests as the existing
frontend checks.

Documentation-only changes need a content review and whitespace check, not a
full native build. Add regression tests for changed behavior where they provide
meaningful coverage. Keep default tests independent of Google and the network.

## Code conventions

- Keep changes focused and preserve existing staged and unstaged work.
- Follow the surrounding style. TypeScript uses single quotes, semicolons, and
  trailing commas compatible with `.prettierrc`.
- Prefer `@/` and `@assets/` import aliases. Keep shared types in `src/types/`
  rather than duplicating them across features.
- Use CSS Modules for component styles and reuse the custom properties in
  `src/shared/styles/tokens.css`. Token changes have regression tests.
- Keep parsing and transformations pure and testable. Prefer named, typed
  values at application boundaries; validate unknown external data.
- Keep Zustand updates immutable and retain request-generation checks so stale
  translation responses cannot overwrite newer queries.
- Avoid unrelated dependency upgrades and broad formatting changes. Update
  corresponding lockfiles when dependencies change.
- Treat `node_modules/`, `dist/`, `src-tauri/target/`, and `src-tauri/gen/` as
  generated output. Do not edit or commit their contents.

## Native window behavior

All four windows are declared with `create: false` in
`src-tauri/tauri.conf.json` and created through `windows::create`. That function
injects `window.__TRANSEE__` before the frontend reads settings at module load.
Preserve this initialization order.

The translation bar is a resident singleton. Closing it hides it; it must not
be destroyed or cause the tray app to exit. Auxiliary windows may be destroyed
and recreated. Keep the single-instance plugin registered first.

The shortcut, tray action, and second-instance callback share
`windows::show_bar`. Keep their behavior consistent:

- Select the display under the pointer and use that display's scale factor.
  Tauri monitor coordinates are physical pixels; the bar width is 680 logical
  pixels, and the frontend controls its height.
- On macOS, preserve `MoveToActiveSpace` so showing the bar brings it to the
  active desktop. Perform AppKit access on the main thread and before window
  activation. Keep native dependencies and calls behind platform `cfg` gates.
- Show the window before focusing it, and preserve the short show-grace period
  that prevents a transient blur from hiding it immediately.
- Hide-on-blur is enabled in release builds and disabled in debug builds.
- Preserve the macOS default menu: clipboard keyboard shortcuts rely on it.

For window changes, manually check shortcut activation, focus and typing,
clipboard shortcuts, Escape/Cmd+W, and relevant multi-monitor/Space behavior.
Compare UI changes with `baseline/`; a compile check does not verify native
desktop behavior. Report which target platforms were actually tested.

Settings live in the app-data directory through `tauri-plugin-store`. Preserve
the schema-versioned import of legacy Electron settings and existing user
preferences across upgrades.

## Google Translate integration

The implemented request path is:

```text
services/google/client.ts -> platform/translate.ts
  -> google_batchexecute -> src-tauri/src/translate.rs -> reqwest
```

The TypeScript client currently builds the encoded `f.req` body; Rust passes it
through with `.body()` rather than re-encoding it with `.form()`. Preserve the
wire format unless deliberately migrating the transport. Reuse the shared HTTP
client, timeout, and redirect handling.

`docs/google-translate-rpc.md` describes a proposed browser-backed migration for
rich dictionary cards. Its hidden webview, BGR header generation, and new card
parser are not implemented. Revalidate its dated observations against current
Google behavior when undertaking that migration.

For protocol or parser changes, update sanitized fixtures and tests together.
Check absent dictionary fields, corrections, suggestions, audio, and translation
segments. Do not store cookies, session tokens, or personal queries in fixtures.
Keep transport failures from leaving the loading state stuck.

## Packaging and versions

Keep release versions aligned in `package.json`, `package-lock.json`,
`src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`, and
`src-tauri/tauri.conf.json`. Do not bump versions for unrelated changes.

```sh
npm run package # host architecture

# Universal macOS prerequisite and build:
rustup target add aarch64-apple-darwin x86_64-apple-darwin
npm run package -- --target universal-apple-darwin
```

Host bundles land in `src-tauri/target/release/bundle/`; universal bundles land
in `src-tauri/target/universal-apple-darwin/release/bundle/`. A universal app
must contain both `arm64` and `x86_64`; verify the packaged executable with
`lipo -archs` when working on universal builds.

Use the existing environment-based signing and notarization setup documented
in `README.md`; keep credentials out of the repository and logs.
