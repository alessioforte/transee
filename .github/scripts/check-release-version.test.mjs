import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

function check({ version = '3.0.0', tag = `v${version}`, overrides = {} } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'transee-release-test-'));
  try {
    mkdirSync(join(root, '.github/scripts'), { recursive: true });
    mkdirSync(join(root, 'src-tauri'));
    const script = join(root, '.github/scripts/check-release-version.mjs');
    copyFileSync(new URL('./check-release-version.mjs', import.meta.url), script);

    const files = {
      'package.json': JSON.stringify({ version }),
      'package-lock.json': JSON.stringify({
        version,
        packages: { '': { version } },
      }),
      'src-tauri/tauri.conf.json': JSON.stringify({ version }),
      'src-tauri/Cargo.toml': `[package]\nname = "transee"\nversion = "${version}"\n[dependencies]\n`,
      'src-tauri/Cargo.lock': `version = 4\n[[package]]\nname = "other"\nversion = "9.9.9"\n[[package]]\nname = "transee"\nversion = "${version}"\n`,
      ...overrides,
    };
    for (const [file, content] of Object.entries(files)) {
      writeFileSync(join(root, file), content);
    }

    const output = join(root, 'github-output');
    const result = spawnSync(process.execPath, [script, tag], {
      encoding: 'utf8',
      env: { ...process.env, GITHUB_OUTPUT: output },
    });
    return {
      ...result,
      output: result.status === 0 ? readFileSync(output, 'utf8') : '',
    };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('accepts a matching stable tag and writes the job output', () => {
  const result = check();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.output, 'prerelease=false\n');
});

test('marks a prerelease tag as a prerelease', () => {
  const result = check({ version: '3.1.0-beta.1' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.output, 'prerelease=true\n');
});

test('does not confuse hyphens in build metadata with a prerelease', () => {
  const result = check({ version: '3.1.0+build-test' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.output, 'prerelease=false\n');
});

test('rejects a mismatched tag', () => {
  const result = check({ tag: 'v2.1.0' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Expected tag v3\.0\.0, got v2\.1\.0/);
});

const mismatches = {
  'package-lock.json root': [
    'package-lock.json',
    '{"version":"2.1.0","packages":{"":{"version":"3.0.0"}}}',
  ],
  'package-lock.json package': [
    'package-lock.json',
    '{"version":"3.0.0","packages":{"":{"version":"2.1.0"}}}',
  ],
  'Tauri config': ['src-tauri/tauri.conf.json', '{"version":"2.1.0"}'],
  'Cargo manifest': ['src-tauri/Cargo.toml', '[package]\nversion = "2.1.0"\n'],
  'Cargo lockfile': [
    'src-tauri/Cargo.lock',
    '[[package]]\nname = "transee"\nversion = "2.1.0"\n',
  ],
  'missing Cargo package': [
    'src-tauri/Cargo.lock',
    '[[package]]\nname = "other"\nversion = "3.0.0"\n',
  ],
};

for (const [name, [file, content]] of Object.entries(mismatches)) {
  test(`rejects ${name} with an inconsistent or missing version`, () => {
    const result = check({ overrides: { [file]: content } });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /expected version 3\.0\.0/);
  });
}
