#!/usr/bin/env node
// Responsive derivatives for every source image: AVIF + WebP at 480/800/1200/1600/2000 px and the
// native width, never above the source width. Images with alpha (cutouts, D31) get WebP only, alpha
// kept. Originals are never modified. Uses ffmpeg (no npm deps).
// Usage: node tools/media.mjs [--force] [path-prefix ...]     e.g. node tools/media.mjs images/cut
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { setRoot, dims, optStem, variants, hasAlpha } from './lib/images.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
setRoot(ROOT);
// 2560 serves a full-width figure at 2x; masters are already capped (D51), so the native width stays reasonable
const WIDTHS = [480, 800, 1200, 1600, 2000, 2560];
const SKIP = /^images\/(opt|og|brand|images)\//;
const FORCE = process.argv.includes('--force');
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));

const walk = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]);
const sources = walk('images').filter((f) => /\.(jpe?g|png)$/i.test(f) && !SKIP.test(f) && (!only.length || only.some((o) => f.startsWith(o))));

let made = 0;
for (const rel of sources) {
  const { w } = dims(rel);
  const want = [...WIDTHS.filter((x) => x < w), w];
  const stem = path.join(ROOT, optStem(rel));
  const alpha = hasAlpha(rel);
  if (FORCE && fs.existsSync(path.dirname(stem))) { // drop every stale derivative of this stem
    const base = path.basename(stem) + '-';
    for (const f of fs.readdirSync(path.dirname(stem))) if (f.startsWith(base) && /^\d+\.(avif|webp)$/.test(f.slice(base.length))) fs.unlinkSync(path.join(path.dirname(stem), f));
  }
  // a width is current only if its WebP is newer than the source; widths above the native one are stale
  const srcTime = fs.statSync(path.join(ROOT, rel)).mtimeMs;
  const dir = path.dirname(stem), base = path.basename(stem) + '-';
  if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) {
    const m = f.startsWith(base) && /^(\d+)\.(avif|webp)$/.exec(f.slice(base.length));
    if (m && (+m[1] > w || fs.statSync(path.join(dir, f)).mtimeMs < srcTime)) fs.unlinkSync(path.join(dir, f));
  }
  const have = new Set(variants(rel));
  const todo = want.filter((x) => !have.has(x));
  if (!todo.length) continue;
  fs.mkdirSync(path.dirname(stem), { recursive: true });
  for (const x of todo) {
    const scale = x === w ? null : `scale=${x}:-2:flags=lanczos`;
    if (!alpha) execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(ROOT, rel), '-vf', scale ? `${scale},format=yuv420p` : 'format=yuv420p', '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '30', '-cpu-used', '4', `${stem}-${x}.avif`]);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(ROOT, rel), '-vf', scale || 'null', '-c:v', 'libwebp', '-quality', alpha ? '80' : '78', `${stem}-${x}.webp`]);
    made++;
  }
  console.log(`${rel} (${w}px${alpha ? ', alpha: WebP only' : ''}): ${todo.join(', ')}`);
}
console.log(`${made} width(s) written`);
