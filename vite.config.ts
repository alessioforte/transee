import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// @tauri-apps/cli sets these; they are how we branch build target per platform.
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],

  // styled-components v5 reads process.env.NODE_ENV (plus SC_ATTR /
  // SC_DISABLE_SPEEDY) at module scope. Webpack injected `process` for free;
  // Vite does not, so without this the very first import throws
  // "process is not defined" and nothing renders. Phase 2 removes
  // styled-components entirely, and this define along with it.
  define: {
    'process.env': JSON.stringify({ NODE_ENV: mode }),
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // Tauri expects a fixed port and its own error reporting.
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: 'ws', host, port: 1421 } : undefined,
    watch: {
      // src-tauri churns on every cargo build; watching it wedges HMR.
      ignored: ['**/src-tauri/**'],
    },
  },

  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  build: {
    // WebView2 on Windows is evergreen Chromium; macOS is pinned to the WKWebView
    // shipped with the minimum system version we support (bundle.macOS.minimumSystemVersion).
    target: process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari14',
    minify: process.env.TAURI_ENV_DEBUG ? false : 'esbuild',
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
}));
