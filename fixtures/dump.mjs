// Dumps real Google batchexecute responses for the three operations the app uses.
// Replicates src/renderer/services/api.ts request construction byte-for-byte
// (JSON.stringify + encodeURI) so the saved bodies are valid parser() inputs.
//
// Usage: node fixtures/dump.mjs [operation...]   (no arguments dumps all of them)
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const URL = 'https://translate.google.com/_/TranslateWebserverUi/data/batchexecute';

const OPERATIONS = {
  translation: [['MkEWBc', JSON.stringify([['hello world', 'en', 'it', true], [null]]), null, 'generic']],
  hints: [['AVdN8', JSON.stringify(['hel', 'en', 'it']), null, 'generic']],
  voice: [['jQ1olc', JSON.stringify(['hello', 'en', false, null]), null, 'generic']],
  'translation-auto': [['MkEWBc', JSON.stringify([['guten Morgen', 'auto', 'it', true], [null]]), null, 'generic']],
  'translation-website': [['MkEWBc', JSON.stringify([['https://example.com/', 'en', 'it', true], [null]]), null, 'generic']],
  simple: [['MKPkhb', JSON.stringify([['hello world', 'en', 'it']]), null, 'generic']],
};

const selected = process.argv.slice(2);
for (const name of selected) {
  if (!(name in OPERATIONS)) throw new Error(`unknown operation: ${name}`);
}

for (const [operation, rpc] of Object.entries(OPERATIONS)) {
  if (selected.length > 0 && !selected.includes(operation)) continue;
  const body = `f.req=${encodeURI(JSON.stringify([rpc]))}`;
  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      // axios@1.6.8 defaults, which is what the Electron main process sends today
      'user-agent': 'axios/1.6.8',
      accept: 'application/json, text/plain, */*',
    },
    body,
  });
  if (!res.ok) {
    console.error(`${operation}: HTTP ${res.status}`);
    process.exitCode = 1;
    continue;
  }
  const text = await res.text();
  const file = join(here, `${operation}.txt`);
  writeFileSync(file, text);
  console.log(`${operation}: ${text.length} bytes -> ${file}`);
}
