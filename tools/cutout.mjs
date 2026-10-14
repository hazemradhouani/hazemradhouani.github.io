#!/usr/bin/env node
// Transparent cutouts of drawings (D29, D30). Each sheet's own paper is keyed to alpha:
// paper colour = per-channel median of a border band; white-balance so the paper reads 255
// (anything lighter clamps to white); exact white-to-alpha with colour unblended; a noise floor;
// trim to the ink plus a margin. Writes images/cut/<dir>/<stem>.png; masters are never touched.
// Zero npm dependencies: ffmpeg decodes and encodes, Node does the pixel maths.
// Usage: node tools/cutout.mjs [--force] [--sheet] [path-prefix ...]
//   --sheet  also writes review contact sheets (on white, Field dark and magenta) to tools/.cache/cutouts/
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { setRoot, dims, cutFor } from './lib/images.mjs';
import { reviewFilter } from './lib/cutout-review.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
setRoot(ROOT);
const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const SHEET = args.includes('--sheet');
const only = args.filter((a) => !a.startsWith('--'));
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const conf = read('tools/cutout.json');
const DEF = { floor: 0.06, knee: 0.14, margin: 0.01, band: 0.02, halo: 10, alpha: 'graded', ...conf.defaults };

// targets: every image of a drawing figure, plus the extras, minus the exclusions
const targets = new Set();
for (const f of fs.readdirSync(path.join(ROOT, 'content/projects'))) {
  for (const g of read(`content/projects/${f}`).figures) {
    if (g.kind !== 'drawing') continue;
    for (const s of g.items ? g.items.map((i) => i.src) : [g.src]) targets.add(s);
  }
}
for (const s of conf.extra || []) targets.add(s);
for (const s of Object.keys(conf.exclude || {})) targets.delete(s);
// an excluded drawing must not keep an old cutout (the build would still use it)
for (const s of Object.keys(conf.exclude || {})) { const c = path.join(ROOT, cutFor(s)); if (fs.existsSync(c)) { fs.unlinkSync(c); console.log(`removed stale cutout of excluded ${s}`); } }
const list = [...targets].filter((s) => !only.length || only.some((o) => s.startsWith(o))).sort();

const decode = (rel, w, h) => {
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(ROOT, rel), '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: w * h * 4 + 1024 });
  if (buf.length !== w * h * 4) throw new Error(`${rel}: decoded ${buf.length} bytes, expected ${w * h * 4}`);
  return buf;
};
const median = (a) => { a.sort((m, n) => m - n); return a[a.length >> 1]; };

function cut(rel, o) {
  const { w: W, h: H } = dims(rel);
  const px = decode(rel, W, H);
  // 1. paper colour
  let P = o.paper;
  if (!P) {
    const band = Math.max(2, Math.round(Math.min(W, H) * o.band)); const ch = [[], [], []];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (x >= band && x < W - band && y >= band && y < H - band) { x = W - band - 1; continue; }
      const i = (y * W + x) * 4; ch[0].push(px[i]); ch[1].push(px[i + 1]); ch[2].push(px[i + 2]);
    }
    P = ch.map(median);
  }
  if (Math.min(...P) < 200) throw new Error(`${rel}: border median ${P} is not paper; set "paper" in tools/cutout.json or exclude it`);
  // 2-4. white-balance, white-to-alpha, unblend, noise floor; track the ink and its bbox.
  // "graded" keeps the exact alpha (for use on any ground). "halo" is a legacy, light-field-only
  // exception: it keeps each pixel's colour as composited on white and makes it opaque within
  // `halo` px of ink. It must never be declared dark-compatible.
  const graded = o.alpha === 'graded';
  const ink = new Uint8Array(W * H);
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let p = 0, i = 0; p < W * H; p++, i += 4) {
    const r = Math.min(255, px[i] * 255 / P[0]), g = Math.min(255, px[i + 1] * 255 / P[1]), b = Math.min(255, px[i + 2] * 255 / P[2]);
    const a = (255 - Math.min(r, g, b)) / 255;
    const a2 = a <= o.floor ? 0 : a >= o.knee ? a : a * (a - o.floor) / (o.knee - o.floor);
    if (graded) {
      if (a > 0) { px[i] = Math.round(Math.max(0, 255 - (255 - r) / a)); px[i + 1] = Math.round(Math.max(0, 255 - (255 - g) / a)); px[i + 2] = Math.round(Math.max(0, 255 - (255 - b) / a)); }
      else px[i] = px[i + 1] = px[i + 2] = 255;
      px[i + 3] = Math.round(a2 * 255);
    } else {
      const k = a > 0 ? a2 / a : 0; // composited over white: 255 - a2 * (255 - unblended)
      px[i] = Math.round(255 - k * (255 - r)); px[i + 1] = Math.round(255 - k * (255 - g)); px[i + 2] = Math.round(255 - k * (255 - b));
    }
    if (a2 * 255 > 5) { ink[p] = 1; const x = p % W, y = (p - x) / W; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 < 0) throw new Error(`${rel}: nothing left after keying`);
  if (!graded) { // alpha = ink dilated by `halo` px (separable distance test, rows then columns)
    const R = o.halo, t = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) {
      let last = -1e9; for (let x = 0; x < W; x++) { if (ink[y * W + x]) last = x; t[y * W + x] = x - last <= R ? 1 : 0; }
      last = 1e9; for (let x = W - 1; x >= 0; x--) { if (ink[y * W + x]) last = x; if (last - x <= R) t[y * W + x] = 1; }
    }
    for (let x = 0; x < W; x++) {
      let last = -1e9; for (let y = 0; y < H; y++) { if (t[y * W + x]) last = y; px[(y * W + x) * 4 + 3] = y - last <= R ? 255 : 0; }
      last = 1e9; for (let y = H - 1; y >= 0; y--) { if (t[y * W + x]) last = y; if (last - y <= R) px[(y * W + x) * 4 + 3] = 255; }
    }
  }
  // 5. trim to the ink plus a uniform margin
  const m = Math.round(Math.max(W, H) * o.margin);
  x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(W - 1, x1 + m); y1 = Math.min(H - 1, y1 + m);
  const cw = x1 - x0 + 1, chh = y1 - y0 + 1; const out = Buffer.alloc(cw * chh * 4);
  for (let y = 0; y < chh; y++) px.copy(out, y * cw * 4, ((y + y0) * W + x0) * 4, ((y + y0) * W + x0 + cw) * 4);
  const dest = path.join(ROOT, cutFor(rel));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${cw}x${chh}`, '-i', '-', '-frames:v', '1', '-compression_level', '9', dest], { input: out });
  return { paper: P, from: [W, H], to: [cw, chh] };
}

let made = 0;
const done = [];
const confTime = fs.statSync(path.join(ROOT, 'tools/cutout.json')).mtimeMs;
for (const rel of list) {
  const dest = path.join(ROOT, cutFor(rel));
  const o = { ...DEF, ...(conf.images || {})[rel] };
  const fresh = fs.existsSync(dest) && fs.statSync(dest).mtimeMs > Math.max(fs.statSync(path.join(ROOT, rel)).mtimeMs, confTime);
  if (!FORCE && fresh) { done.push(rel); continue; }
  const r = cut(rel, o);
  console.log(`${rel}: paper ${r.paper.join(',')} | ${r.from.join('x')} -> ${r.to.join('x')}`);
  made++; done.push(rel);
}
console.log(`${made} cutout(s) written, ${done.length} current`);

// Review each cutout over white, Field charcoal and magenta. The same derivative is composited in
// all three panels, so a white fringe or lost fine line cannot be hidden by a light field.
if (SHEET) {
  const dir = path.join(ROOT, 'tools/.cache/cutouts'); fs.mkdirSync(dir, { recursive: true });
  for (const rel of done) {
    const src = path.join(ROOT, cutFor(rel));
    const name = cutFor(rel).replace(/^images\/cut\//, '').replace(/[\/.]/g, '_');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-filter_complex', reviewFilter(),
      '-frames:v', '1', path.join(dir, name + '.jpg')]);
  }
  console.log(`review sheets in ${path.relative(ROOT, dir)}`);
}
