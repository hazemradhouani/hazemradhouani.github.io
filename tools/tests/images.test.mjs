import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { darkOf, setRoot, variants } from '../lib/images.mjs';

const tmpDirs = [];

test.afterEach(() => {
  while (tmpDirs.length) fs.rmSync(tmpDirs.pop(), { recursive: true, force: true });
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
