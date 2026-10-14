import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { setRoot, variants } from '../lib/images.mjs';

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
