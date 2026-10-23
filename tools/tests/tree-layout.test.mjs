import assert from 'node:assert/strict';
import test from 'node:test';
import { placeLeaves, connector, TREE } from '../lib/tree-layout.mjs';

// tree layout (D110): synthetic ratios with the content's spread (quantiles measured 2026-10-23: drawings run
// from a 0.4 portrait to an 8.5:1 section), drawn in a shuffled order
const spread = (n, q, seed) => {
  const at = (u) => { const k = q.findIndex(([p]) => p >= u); const [p0, r0] = q[Math.max(0, k - 1)], [p1, r1] = q[k]; return r0 * Math.pow(r1 / r0, p1 > p0 ? (u - p0) / (p1 - p0) : 0); };
  const rs = Array.from({ length: n }, (_, i) => at(n > 1 ? i / (n - 1) : 0.5));
  let s = seed; for (let i = n - 1; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [rs[i], rs[j]] = [rs[j], rs[i]]; }
  return rs;
};
const families = {
  projects: spread(15, [[0, 0.66], [0.1, 0.71], [0.5, 1.52], [0.9, 1.78], [1, 2.85]], 7),
  drawings: spread(132, [[0, 0.4], [0.1, 0.75], [0.5, 1.4], [0.9, 3.5], [1, 8.5]], 11),
  renders: spread(78, [[0, 0.69], [0.1, 1], [0.5, 1.58], [0.9, 2.2], [1, 4.22]], 13),
  films: [16 / 9, 16 / 9, 16 / 9] };
const PX = (1440 - 2 * 0.022 * 1440) / TREE.W;   // px a unit at 1440 (the tree spans the page between its edges)

for (const [name, ratios] of Object.entries(families)) {
  test(`${name}: every leaf inside the field, none overlapping, each at its own ratio`, () => {
    const { h, leaves } = placeLeaves(ratios, { seed: 3 });
    assert.equal(leaves.length, ratios.length);
    assert.ok(h >= TREE.H0 && h <= TREE.HMAX, `canvas ${h}`);
    leaves.forEach((l, i) => {
      assert.ok(l.x >= TREE.X0 - 0.1 && l.x + l.w <= TREE.W - TREE.PAD + 0.2 && l.y >= TREE.PAD - 0.1 && l.y + l.h <= h - TREE.PAD + 0.2, `leaf ${i} outside: ${JSON.stringify(l)}`);
      assert.ok(Math.abs(l.w / l.h - ratios[i]) / ratios[i] < 0.01, `leaf ${i} ratio ${l.w / l.h} vs ${ratios[i]}`);
      for (let j = i + 1; j < leaves.length; j++) {
        const m = leaves[j];
        assert.ok(l.x + l.w <= m.x || m.x + m.w <= l.x || l.y + l.h <= m.y || m.y + m.h <= l.y, `leaves ${i} and ${j} overlap`);
      }
    });
  });
  test(`${name}: equal area within 2% where the short side is above the floor, and that floor is 40px at 1440`, () => {
    const { leaves, area } = placeLeaves(ratios, { seed: 3 });
    for (const l of leaves) {
      assert.ok(Math.min(l.w, l.h) * PX >= 40 - 0.5, `short side ${(Math.min(l.w, l.h) * PX).toFixed(1)}px`);
      if (Math.min(l.w, l.h) > TREE.MIN + 0.2) assert.ok(Math.abs(l.w * l.h - area) / area < 0.02, `area ${l.w * l.h} vs ${area}`);
    }
  });
}

test('the same seed gives the same field; another seed another', () => {
  const r = families.renders;
  assert.deepEqual(placeLeaves(r, { seed: 5 }), placeLeaves(r, { seed: 5 }));
  assert.notDeepEqual(placeLeaves(r, { seed: 5 }).leaves, placeLeaves(r, { seed: 6 }).leaves);
});

test('leaves keep the given order: each one starts right of the last in its row, or lower down in a new one', () => {
  const { leaves } = placeLeaves(families.drawings, { seed: 3 });
  for (let i = 1; i < leaves.length; i++) {
    const a = leaves[i - 1], b = leaves[i];
    assert.ok(b.x >= a.x + a.w || b.y + b.h > a.y + a.h, `leaf ${i} reads before ${i - 1}`);
  }
});

test('a connector leaves its pill level and arrives level at the leaf\'s left middle', () => {
  assert.equal(connector({ x: 210, y: 300 }, { x: 610, y: 100, w: 80, h: 40 }), 'M210 300C390 300 390 120 610 120');
});

test('a leaf too wide for the field fails the build', () => {
  assert.throws(() => placeLeaves([40]), /wider than the field/u);
});
