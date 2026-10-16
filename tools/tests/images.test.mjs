import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { darkOf, setRoot, variants } from '../lib/images.mjs';

const tmpDirs = [];

test.afterEach(() => {
  while (tmpDirs.length) fs.rmSync(tmpDirs.pop(), { recursive: true, force: true });
});

// the repository as committed: what GitHub Pages will serve
const REPO = fileURLToPath(new URL('../..', import.meta.url));
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));

test('every shipped cutout has its sidecar and a reviewed dark treatment (D49, D50)', () => {
  const missing = [];
  for (const png of walk(path.join(REPO, 'images/cut')).filter((f) => f.endsWith('.png'))) {
    const side = png.replace(/\.png$/u, '.json');
    const rel = path.relative(REPO, png).split(path.sep).join('/');
    if (!fs.existsSync(side)) { missing.push(`${rel}: no sidecar`); continue; }
    const dark = JSON.parse(fs.readFileSync(side, 'utf8')).dark;
    if (!['invert', 'invert-accent', 'field', 'object'].includes(dark)) missing.push(`${rel}: dark ${dark}`);
  }
  assert.deepEqual(missing, []);
});

test('every image a built page references is tracked by git, so the deploy cannot 404 on an ignored file', () => {
  const tracked = new Set(execFileSync('git', ['ls-files', '-z', 'images'], { cwd: REPO, encoding: 'utf8' }).split('\0'));
  const pages = [...fs.readdirSync(REPO).filter((f) => f.endsWith('.html')), ...fs.readdirSync(path.join(REPO, 'projects')).map((f) => `projects/${f}`)];
  const untracked = new Set();
  for (const page of pages) {
    for (const m of fs.readFileSync(path.join(REPO, page), 'utf8').matchAll(/(?:\.\.\/)?(images\/[^\s"',)]+\.(?:webp|avif|jpe?g|png|svg))/gu)) {
      const rel = decodeURIComponent(m[1]);
      if (!tracked.has(rel)) untracked.add(`${page}: ${rel}`);
    }
  }
  assert.deepEqual([...untracked], []);
});

test('responsive source sets ignore zero-byte derivatives left by an interrupted encoder', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'image-variants-'));
  tmpDirs.push(root);
  const dir = path.join(root, 'images', 'opt', 'demo');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'scene-480.webp'), 'valid derivative');
  fs.writeFileSync(path.join(dir, 'scene-800.webp'), '');
  fs.writeFileSync(path.join(dir, 'scene-480.avif'), 'valid derivative');
  fs.writeFileSync(path.join(dir, 'scene-800.avif'), '');

  setRoot(root);
  assert.deepEqual(variants('images/demo/scene.jpg'), [480]);
});

test('a cutout reports the dark treatment chosen in its sidecar, and the inspection field when none is set (D50)', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'image-dark-'));
  tmpDirs.push(root);
  const dir = path.join(root, 'images', 'cut', 'demo');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'plan.json'), JSON.stringify({ dark: 'invert' }));
  fs.writeFileSync(path.join(dir, 'sheet.json'), JSON.stringify({ dark: null }));
  setRoot(root);
  assert.equal(darkOf('images/cut/demo/plan.png'), 'invert');
  assert.equal(darkOf('images/cut/demo/sheet.png'), 'field');
  assert.equal(darkOf('images/cut/demo/unknown.png'), 'field');
  assert.equal(darkOf('images/demo/render.jpg'), null);
});
