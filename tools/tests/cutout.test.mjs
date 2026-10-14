import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { REVIEW_BACKDROPS, reviewFilter } from '../lib/cutout-review.mjs';
import { inspectCutoutRgba } from '../lib/cutout-alpha.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('dark-compatible drawings default to graded alpha instead of an opaque halo', () => {
  const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/cutout.json'), 'utf8'));
  const script = fs.readFileSync(path.join(ROOT, 'tools/cutout.mjs'), 'utf8');
  assert.equal(config.defaults.alpha, 'graded');
  assert.doesNotMatch(script, /alpha:\s*'halo'/u);
});

test('a cutout review sheet composites the same alpha derivative on white, Field dark and magenta', () => {
  assert.deepEqual(REVIEW_BACKDROPS, ['white', '0x121311', '0xff00ff']);
  const filter = reviewFilter();
  assert.match(filter, /split=6/u);
  assert.match(filter, /drawbox=c=white:t=fill/u);
  assert.match(filter, /drawbox=c=0x121311:t=fill/u);
  assert.match(filter, /drawbox=c=0xff00ff:t=fill/u);
  assert.match(filter, /hstack=inputs=3/u);
});

test('cutout alpha inspection detects an opaque white fringe while retaining antialiased detail', () => {
  const pixels = new Uint8ClampedArray([
    // transparent / transparent / transparent
    255, 255, 255, 0,  255, 255, 255, 0,  255, 255, 255, 0,
    // transparent / opaque white fringe / antialiased ink
    255, 255, 255, 0,  255, 255, 255, 255, 20, 20, 20, 128,
    // transparent / opaque ink / transparent
    255, 255, 255, 0,  10, 10, 10, 255,  255, 255, 255, 0
  ]);
  const result = inspectCutoutRgba(pixels, 3, 3);
  assert.equal(result.opaqueWhiteEdge, 1);
  assert.equal(result.partialAlpha, 1);
  assert.equal(result.hasDetail, true);
  assert.equal(result.hasWhiteFringe, true);
});

test('browser QA gates white fringes and missing antialiased detail, not just transparent corners', () => {
  const qa = fs.readFileSync(path.join(ROOT, 'tools/qa.mjs'), 'utf8');
  assert.match(qa, /inspectCutoutRgba/u);
  assert.match(qa, /opaque white edge/u);
  assert.match(qa, /no partial-alpha detail/u);
});
