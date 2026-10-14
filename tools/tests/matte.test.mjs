import assert from 'node:assert/strict';
import test from 'node:test';
import { keyInk, eraseComponents, objectMatte, clippedSides, classifyInk, despeckle, paperField } from '../lib/matte.mjs';

// a W x H RGBA canvas filled with paper, and helpers to paint on it
function canvas(W, H, paper = [255, 255, 255]) {
  const px = new Uint8ClampedArray(W * H * 4);
  for (let p = 0; p < W * H; p++) px.set([...paper, 255], p * 4);
  return { px, W, H, set: (x, y, c) => px.set([...c, 255], (y * W + x) * 4), at: (x, y) => [...px.subarray((y * W + x) * 4, (y * W + x) * 4 + 4)] };
}
const rect = (c, x0, y0, w, h, col) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) c.set(x, y, col); };
const OPTS = { paper: [255, 255, 255], floor: 0.06, knee: 0.14 };

test('ink keying: black stays opaque black, grey antialiasing becomes partial black, paper becomes clear, tints round-trip', () => {
  const c = canvas(4, 1);
  c.set(0, 0, [0, 0, 0]); c.set(1, 0, [128, 128, 128]); c.set(3, 0, [200, 235, 200]);
  keyInk(c.px, 4, 1, OPTS);
  assert.deepEqual(c.at(0, 0), [0, 0, 0, 255]);
  const [r, , , a] = c.at(1, 0);
  assert.equal(r, 0); assert.ok(Math.abs(a - 127) <= 1, `alpha ${a}`);
  assert.equal(c.at(2, 0)[3], 0);
  // composited back over white, the pale tint returns to its original colour (within rounding)
  const [tr, tg, tb, ta] = c.at(3, 0); const k = ta / 255;
  const back = [tr, tg, tb].map((v) => Math.round(v * k + 255 * (1 - k)));
  [200, 235, 200].forEach((v, i) => assert.ok(Math.abs(back[i] - v) <= 2, `channel ${i}: ${back[i]} vs ${v}`));
});

test('annotation removal takes only components wholly inside the rectangle; a crossing line survives', () => {
  const c = canvas(40, 20);
  rect(c, 5, 5, 4, 6, [0, 0, 0]);          // a glyph, isolated, inside the rectangle
  rect(c, 0, 15, 40, 1, [0, 0, 0]);        // a line crossing the rectangle's lower part
  const report = eraseComponents(c.px, 40, 20, [{ id: 't1', x: 2, y: 2, w: 20, h: 16 }], OPTS);
  assert.deepEqual(c.at(6, 6), [255, 255, 255, 255]);   // glyph is now paper
  assert.deepEqual(c.at(10, 15), [0, 0, 0, 255]);       // line kept inside the rectangle
  assert.equal(report[0].removed, 1);
  assert.equal(report[0].kept, 1);
  assert.deepEqual(report[0].bbox, { x: 5, y: 5, w: 4, h: 6 });
});

test('object matte keeps enclosed white surfaces opaque and turns the cast shadow translucent', () => {
  const c = canvas(30, 30);
  rect(c, 8, 8, 12, 12, [0, 0, 0]);         // outline square...
  rect(c, 9, 9, 10, 10, [255, 255, 255]);   // ...with a white face inside
  rect(c, 20, 10, 4, 10, [200, 200, 200]);  // a soft grey shadow on the paper
  objectMatte(c.px, 30, 30, { ...OPTS, tol: 0.4, grad: 1 });
  assert.equal(c.at(14, 14)[3], 255);       // white face stays solid
  assert.equal(c.at(2, 2)[3], 0);           // paper is clear
  const [sr, , , sa] = c.at(21, 15);
  assert.ok(sa > 30 && sa < 80 && sr < 20, `shadow ${c.at(21, 15)}`); // translucent black
});

test('edge clearance reports every side where ink touches the crop edge', () => {
  const c = canvas(10, 10);
  rect(c, 0, 4, 3, 1, [0, 0, 0]);
  rect(c, 4, 9, 1, 1, [0, 0, 0]);
  keyInk(c.px, 10, 10, OPTS);
  assert.deepEqual(clippedSides(c.px, 10, 10), ['left', 'bottom']);
});

test('ink classification separates greyscale linework, thin colour accents and colour-coded fills', () => {
  const mono = canvas(50, 50); rect(mono, 10, 10, 30, 2, [0, 0, 0]); rect(mono, 10, 20, 30, 6, [120, 120, 120]);
  const accent = canvas(50, 50); rect(accent, 0, 4, 50, 30, [0, 0, 0]); rect(accent, 10, 45, 30, 1, [220, 30, 30]);
  const colour = canvas(50, 50); rect(colour, 5, 5, 40, 40, [200, 235, 200]); rect(colour, 5, 5, 40, 1, [0, 0, 0]);
  for (const c of [mono, accent, colour]) keyInk(c.px, 50, 50, OPTS);
  assert.equal(classifyInk(mono.px, 50, 50).suggest, 'mono');
  assert.equal(classifyInk(accent.px, 50, 50).suggest, 'accent');
  assert.equal(classifyInk(colour.px, 50, 50).suggest, 'colour');
});

test('despeckle drops faint isolated specks but keeps strong small marks such as dots', () => {
  const c = canvas(20, 20);
  c.set(3, 3, [215, 215, 215]); c.set(4, 3, [215, 215, 215]);   // faint 2 px speck
  c.set(12, 12, [0, 0, 0]); c.set(13, 12, [0, 0, 0]);           // a real 2 px dot
  keyInk(c.px, 20, 20, OPTS);
  const removed = despeckle(c.px, 20, 20, { speck: 6, faint: 0.35 });
  assert.equal(c.at(3, 3)[3], 0);
  assert.equal(c.at(12, 12)[3], 255);
  assert.equal(removed, 1);
});

test('a fitted paper field white-balances an uneven, vignetted ground', () => {
  const c = canvas(40, 40);
  for (let y = 0; y < 40; y++) for (let x = 0; x < 40; x++) { const v = Math.round(235 - 0.02 * ((x - 20) ** 2 + (y - 20) ** 2) / 8); c.set(x, y, [v, v, v]); }
  rect(c, 18, 18, 4, 4, [0, 0, 0]);
  const field = paperField(c.px, 40, 40, 0.15);
  keyInk(c.px, 40, 40, { ...OPTS, paper: field });
  assert.equal(c.at(1, 1)[3], 0);           // vignetted corner reads as paper
  assert.equal(c.at(30, 5)[3], 0);
  assert.equal(c.at(19, 19)[3], 255);
});
