import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// D79: the smooth-scroll engine ships as a vendored copy of the exactly pinned devDependency, unchanged
// but for its licence banner and the source-map comment (the map is not shipped)
const REPO = fileURLToPath(new URL('../..', import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.join(REPO, 'package.json'), 'utf8'));

test('the vendored Lenis is the pinned release, byte for byte', () => {
  const version = pkg.devDependencies.lenis;
  assert.match(version, /^\d+\.\d+\.\d+$/u, 'lenis must be pinned to an exact version');
  const shipped = path.join(REPO, `js/vendor/lenis-${version}.min.js`);
  assert.ok(fs.existsSync(shipped), `js/vendor/lenis-${version}.min.js is missing`);
  assert.ok(fs.existsSync(path.join(REPO, 'js/vendor/LICENSE-lenis.txt')), 'the MIT licence must ship with it');
  const source = path.join(REPO, 'node_modules/lenis/dist/lenis.min.js');
  if (!fs.existsSync(source)) return;   // without node_modules only the pin and the files are checked
  const body = fs.readFileSync(shipped, 'utf8').replace(/^\/\*![\s\S]*?\*\/\n/u, '');
  assert.equal(body, fs.readFileSync(source, 'utf8').replace(/^\/\/# sourceMappingURL=.*\n?/mu, ''));
  assert.equal(JSON.parse(fs.readFileSync(path.join(REPO, 'node_modules/lenis/package.json'), 'utf8')).version, version);
});

test('the site loads the vendored file by the pinned name', () => {
  const js = fs.readFileSync(path.join(REPO, 'js/site.js'), 'utf8');
  assert.ok(js.includes(`vendor/lenis-${pkg.devDependencies.lenis}.min.js`), 'site.js must load the pinned vendored file');
});
