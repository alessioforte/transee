import { invoke } from '@tauri-apps/api/core';

/**
 * Replaces the `request`/`response`/`error` IPC triplet.
 *
 * The body is built here rather than in Rust because it is produced with JS
 * `encodeURI`, whose escape set (`;,/?:@&=+$-_.!~*'()#` left alone) no Rust
 * percent-encoder reproduces. Rust takes it as an opaque string.
 *
 * Unlike the Electron version — where `window.electron.request` was declared
 * `async` but actually returned `ipcRenderer.send(...)`, i.e. a
 * `Promise<undefined>` — this really does resolve with the response body.
 */
export function batchexecute(body: string): Promise<string> {
  return invoke<string>('google_batchexecute', { body });
}
