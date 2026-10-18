import { appendFileSync, readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const readText = (path) => readFileSync(new URL(path, root), 'utf8');
const readJson = (path) => JSON.parse(readText(path));

function tomlVersion(table) {
  return table?.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
}

const pkg = readJson('package.json');
const lock = readJson('package-lock.json');
const cargoPackage = readText('src-tauri/Cargo.toml')
  .split(/^\[/m)
  .find((table) => table.startsWith('package]'));
const cargoLockPackage = readText('src-tauri/Cargo.lock')
  .split('[[package]]')
  .find((table) => /^name\s*=\s*"transee"\s*$/m.test(table));

const versions = {
  'package.json': pkg.version,
  'package-lock.json': lock.version,
  'package-lock.json packages[""]': lock.packages?.['']?.version,
  'src-tauri/tauri.conf.json': readJson('src-tauri/tauri.conf.json').version,
  'src-tauri/Cargo.toml': tomlVersion(cargoPackage),
  'src-tauri/Cargo.lock (transee)': tomlVersion(cargoLockPackage),
};

for (const [file, version] of Object.entries(versions)) {
  if (typeof version !== 'string' || version !== pkg.version) {
    throw new Error(`${file}: expected version ${pkg.version}, got ${version}`);
  }
}

const tag = process.argv[2];
if (tag !== `v${pkg.version}`) {
  throw new Error(`Expected tag v${pkg.version}, got ${tag ?? '(no tag)'}`);
}

const prerelease = pkg.version.split('+')[0].includes('-');
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `prerelease=${prerelease}\n`);
}
console.log(`Validated ${tag} across all release manifests (prerelease=${prerelease}).`);
