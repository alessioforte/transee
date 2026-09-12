# Baseline screenshots (pre-migration reference)

Captured from the **Electron 18 dev build** (`npm start`, commit `17d15a2`) on macOS,
Retina 2x — so every PNG is 2× the logical window size. These are the reference for
"the UI must not change" during the Tauri migration.

| File | Logical size | What it shows |
|---|---|---|
| `bar-collapsed.png` | 680×85 | Translation bar at rest, placeholder "Translate" |
| `bar-expanded.png` | 680×246 | `hello` → `Ciao`, 3 suggestions, both speaker icons. Exercises the `#root.scrollHeight` → `setSize(680, h)` resize loop |
| `about.png` | 520×253 | About window |
| `preferences.png` | 420×430 | Preferences, shortcut recorder showing `Ctrl` `Alt` `T` |
| `welcome-step1.png` | 520×430 | Welcome guide, carousel step 1 of 3 |

## Missing

Welcome carousel steps 2 and 3. Advancing the carousel needs a synthetic mouse click,
and `osascript` is denied Accessibility access on this machine (`-25211`) — `keystroke`
is permitted but `click at` is not. Grant Terminal/iTerm2 Accessibility permission in
System Settings → Privacy & Security → Accessibility to capture them, or click through
the guide by hand and capture:

```sh
screencapture -x -R<x>,<y>,520,430 baseline/welcome-step2.png
```

Phase 1 does not modify `Welcome/index.tsx`, so the carousel cannot regress from the
shell swap itself; these are only needed as a Phase 2 reference.

## Re-capturing

Windows were moved apart with System Events and captured by region, raising each first:

```sh
osascript -e 'tell application "System Events" to tell process "Electron" to repeat with w in windows
  if size of w = {420, 430} then perform action "AXRaise" of w
end repeat'
screencapture -x -R<x>,<y>,420,430 baseline/preferences.png
```

In dev mode `src/main/main.ts:33-38` opens all four windows at launch, which is what
makes this possible without driving the tray.
