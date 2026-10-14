#!/usr/bin/env node
// Transparent cutouts of drawings and isolated objects (D29, D46, D49, D50). The pixel maths lives in
// tools/lib/matte.mjs; this script decodes each master with ffmpeg, removes declared annotations,
// keys the paper (mode "ink") or only the border-connected background (mode "object"), drops faint
// specks, gates the crop edges, trims to the ink plus a margin and writes:
//   images/cut/<dir>/<stem>.png   the cutout (graded alpha, unblended colour)
//   images/cut/<dir>/<stem>.json  its sidecar: label boxes (% of the cutout), ink class, trim, clip
// Masters are never touched. Settings: tools/cutout.json + tools/cutout.d/<slug>.json (D52).
// Usage: node tools/cutout.mjs [--force] [--sheet] [path-prefix ...]
//   --sheet  also writes review sheets to tools/.cache/cutouts/: <name>.jpg (white | Field charcoal |
//            magenta | the dark-scheme rendering) and <name>-detail.jpg (the densest region at 1:1)
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { setRoot, dims, cutFor } from './lib/images.mjs';
import { reviewFilter, detailFilter } from './lib/cutout-review.mjs';
import { loadCutoutConfig } from './lib/cutout-config.mjs';
import { keyInk, objectMatte, eraseComponents, despeckle, clippedSides, classifyInk, paperField } from './lib/matte.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
setRoot(ROOT);
const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const SHEET = args.includes('--sheet');
const only = args.filter((a) => !a.startsWith('--'));
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const conf = loadCutoutConfig(ROOT);
const DEF = { mode: 'ink', floor: 0.06, knee: 0.14, margin: 0.01, band: 0.02, speck: 4, faint: 0.3, ...conf.defaults };
const ENGINE = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, 'tools/lib/matte.mjs'))).update(fs.readFileSync(fileURLToPath(import.meta.url))).digest('hex');

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
for (const s of Object.keys(conf.exclude || {})) {
  for (const f of [cutFor(s), cutFor(s).replace(/\.png$/u, '.json')]) { const c = path.join(ROOT, f); if (fs.existsSync(c)) { fs.unlinkSync(c); console.log(`removed stale ${f} (excluded)`); } }
}
const list = [...targets].filter((s) => !only.length || only.some((o) => s.startsWith(o))).sort();

const decode = (rel, w, h) => {
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(ROOT, rel), '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], { maxBuffer: w * h * 4 + 1024 });
  if (buf.length !== w * h * 4) throw new Error(`${rel}: decoded ${buf.length} bytes, expected ${w * h * 4}`);
  return buf;
};
const median = (a) => { a.sort((m, n) => m - n); return a[a.length >> 1]; };
const sidecarFor = (rel) => cutFor(rel).replace(/\.png$/u, '.json');
const optionsHash = (rel, o) => crypto.createHash('sha256').update(JSON.stringify([rel, o, ENGINE])).digest('hex').slice(0, 16);

function borderMedian(px, W, H, band) {
  const bw = Math.max(2, Math.round(Math.min(W, H) * band)); const ch = [[], [], []];
  const step = Math.max(1, Math.floor(Math.sqrt((W * H) / 200000)));
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
    if (x >= bw && x < W - bw && y >= bw && y < H - bw) continue;
    const i = (y * W + x) * 4; ch[0].push(px[i]); ch[1].push(px[i + 1]); ch[2].push(px[i + 2]);
  }
  return ch.map(median);
}

function cut(rel, o) {
  const { w: W, h: H } = dims(rel);
  const px = decode(rel, W, H);
  // 1. paper: declared colour, a fitted field (uneven grounds), or the border median
  let paper = o.paper;
  if (paper === 'field') paper = paperField(px, W, H, o.band);
  else if (!paper) {
    paper = borderMedian(px, W, H, o.band);
    if (Math.min(...paper) < 200) throw new Error(`${rel}: border median ${paper} is not paper; set "paper" ([r,g,b] or "field") or exclude it`);
  }
  // 2. declared annotations on blank paper leave the pixels (D49); the text is re-set in HTML
  const erased = eraseComponents(px, W, H, o.erase || [], { paper, floor: o.floor });
  for (const e of erased) if (!e.removed) throw new Error(`${rel}: erase "${e.id}" removed nothing; check its rectangle`);
  // 3. key: the whole sheet (ink) or only the background connected to the border (object)
  const matte = o.mode === 'object'
    ? objectMatte(px, W, H, { paper, floor: o.floor, knee: o.knee, tol: o.tol, grad: o.grad, keep: o.keep, bg: o.bg, band: o.ring })
    : (keyInk(px, W, H, { paper, floor: o.floor, knee: o.knee }), null);
  const specks = despeckle(px, W, H, { speck: o.speck, faint: o.faint });
  // 4. crop-edge gate: ink on an edge means the crop may cut through the drawing
  const clipped = clippedSides(px, W, H);
  const undeclared = clipped.filter((s) => !(o.clip || []).includes(s));
  if (undeclared.length && !o.fullBleed) throw new Error(`${rel}: ink touches the ${undeclared.join(', ')} edge(s); the crop may cut the drawing. Fix the crop, or declare "clip": [${undeclared.map((s) => `"${s}"`).join(', ')}] if the drawing is clipped by design`);
  const ink = classifyInk(px, W, H);
  // 5. trim to the ink plus a uniform margin
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let p = 0; p < W * H; p++) if (px[p * 4 + 3] > 5) { const x = p % W, y = (p - x) / W; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) throw new Error(`${rel}: nothing left after keying`);
  const m = Math.round(Math.max(W, H) * o.margin);
  x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(W - 1, x1 + m); y1 = Math.min(H - 1, y1 + m);
  const cw = x1 - x0 + 1, chh = y1 - y0 + 1; const out = Buffer.alloc(cw * chh * 4);
  for (let y = 0; y < chh; y++) px.copy(out, y * cw * 4, ((y + y0) * W + x0) * 4, ((y + y0) * W + x0 + cw) * 4);
  const dest = path.join(ROOT, cutFor(rel));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${cw}x${chh}`, '-i', '-', '-frames:v', '1', '-compression_level', '9', dest], { input: out });
  // densest region (for the 1:1 review tile)
  const tw = Math.min(640, cw), th = Math.min(400, chh); let tile = [0, 0, tw, th], bestSum = -1;
  const sx = Math.max(1, tw >> 1), sy = Math.max(1, th >> 1);
  for (let ty = 0; ty + th <= chh; ty += sy) for (let tx = 0; tx + tw <= cw; tx += sx) {
    let s = 0; for (let y = ty; y < ty + th; y += 4) for (let x = tx; x < tx + tw; x += 4) s += out[(y * cw + x) * 4 + 3];
    if (s > bestSum) { bestSum = s; tile = [tx, ty, tw, th]; }
  }
  // 6. sidecar: label boxes in % of the cutout, so HTML labels sit where the printed text was
  const pct = (v, n) => +((100 * v) / n).toFixed(3);
  const sidecar = {
    src: rel, hash: optionsHash(rel, o), mode: o.mode, from: [W, H], to: [cw, chh], offset: [x0, y0],
    paper: Array.isArray(paper) ? paper : 'field', clip: clipped, ink, dark: o.dark || null, specks, tile,
    background: matte ? +matte.background.toFixed(4) : null,
    labels: erased.map((e) => ({ id: e.id, removed: e.removed, kept: e.kept, x: pct(e.bbox.x - x0, cw), y: pct(e.bbox.y - y0, chh), w: pct(e.bbox.w, cw), h: pct(e.bbox.h, chh) })),
  };
  fs.writeFileSync(path.join(ROOT, sidecarFor(rel)), `${JSON.stringify(sidecar, null, 1)}\n`);
  return { paper, from: [W, H], to: [cw, chh], sidecar };
}

let made = 0;
const done = [];
const failed = [];
for (const rel of list) {
  const o = { ...DEF, ...(conf.images || {})[rel], fullBleed: rel in (conf.fullBleed || {}) };
  if (o.alpha === 'halo') throw new Error(`${rel}: the "halo" alpha mode is retired (D46, D50); remove it`);
  const dest = path.join(ROOT, cutFor(rel)); const side = path.join(ROOT, sidecarFor(rel));
  const prev = fs.existsSync(side) ? JSON.parse(fs.readFileSync(side, 'utf8')) : null;
  const fresh = prev && fs.existsSync(dest) && fs.statSync(dest).mtimeMs > fs.statSync(path.join(ROOT, rel)).mtimeMs && prev.hash === optionsHash(rel, o);
  if (!FORCE && fresh) { done.push({ rel, sidecar: prev }); continue; }
  let r;
  try { r = cut(rel, o); } catch (e) { failed.push(e.message); continue; }
  const s = r.sidecar;
  console.log(`${rel}: ${o.mode} | paper ${Array.isArray(r.paper) ? r.paper.join(',') : 'field'} | ${r.from.join('x')} -> ${r.to.join('x')} | ink ${s.ink.suggest} (${(s.ink.chromaticFraction * 100).toFixed(2)}% chromatic) | dark ${s.dark || 'unset'}${s.labels.length ? ` | ${s.labels.map((l) => `${l.id}: -${l.removed}${l.kept ? ` (kept ${l.kept} crossing)` : ''}`).join(', ')}` : ''}${s.specks ? ` | ${s.specks} specks` : ''}`);
  if (s.dark && ((s.dark === 'invert' && s.ink.suggest !== 'mono') || (s.dark === 'invert-accent' && s.ink.suggest === 'colour'))) console.log(`  note: dark "${s.dark}" chosen although the ink measures "${s.ink.suggest}"; confirm it on the review sheet`);
  made++; done.push({ rel, sidecar: s });
}
console.log(`${made} cutout(s) written, ${done.length} current${failed.length ? `, ${failed.length} FAILED` : ''}`);
for (const f of failed) console.error(`FAIL ${f}`);
if (failed.length) process.exitCode = 1;

// Review each cutout over white, Field charcoal, magenta and in its dark-scheme rendering, plus the
// densest region at 1:1, so a fringe, a lost fine line or a bad inversion cannot hide.
if (SHEET) {
  const dir = path.join(ROOT, 'tools/.cache/cutouts'); fs.mkdirSync(dir, { recursive: true });
  for (const { rel, sidecar } of done) {
    const src = path.join(ROOT, cutFor(rel));
    const name = cutFor(rel).replace(/^images\/cut\//, '').replace(/[\/.]/g, '_');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-filter_complex', reviewFilter(sidecar.dark), '-frames:v', '1', path.join(dir, name + '.jpg')]);
    const tile = sidecar.tile || [0, 0, Math.min(640, sidecar.to[0]), Math.min(400, sidecar.to[1])];
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-filter_complex', detailFilter(sidecar.dark, tile), '-frames:v', '1', path.join(dir, name + '-detail.jpg')]);
  }
  console.log(`review sheets in ${path.relative(ROOT, dir)}`);
}
