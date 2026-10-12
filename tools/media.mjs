#!/usr/bin/env node
// Responsive derivatives for every source image: AVIF + WebP at 480/800/1200/1600/2000 px and the
// native width, never above the source width. Originals are never modified. Uses ffmpeg (no npm deps).
// Usage: node tools/media.mjs [path-prefix ...]     e.g. node tools/media.mjs images/al-arg
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { setRoot, dims, optStem, variants } from './lib/images.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
setRoot(ROOT);
const WIDTHS = [480, 800, 1200, 1600, 2000];
const SKIP = /^images\/(opt|og|brand|images)\//;
const only = process.argv.slice(2);

const walk = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]);
const sources = walk('images').filter((f) => /\.(jpe?g|png)$/i.test(f) && !SKIP.test(f) && (!only.length || only.some((o) => f.startsWith(o))));

let made = 0;
for (const rel of sources) {
  const { w } = dims(rel);
  const want = [...WIDTHS.filter((x) => x < w), w];
  const have = new Set(variants(rel));
  const todo = want.filter((x) => !have.has(x));
  if (!todo.length) continue;
  const stem = path.join(ROOT, optStem(rel));
  fs.mkdirSync(path.dirname(stem), { recursive: true });
  for (const x of todo) {
    const vf = x === w ? 'format=yuv420p' : `scale=${x}:-2:flags=lanczos,format=yuv420p`;
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(ROOT, rel), '-vf', vf, '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '30', '-cpu-used', '4', `${stem}-${x}.avif`]);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(ROOT, rel), '-vf', x === w ? 'null' : `scale=${x}:-2:flags=lanczos`, '-c:v', 'libwebp', '-quality', '78', `${stem}-${x}.webp`]);
    made++;
  }
  console.log(`${rel} (${w}px): ${todo.join(', ')}`);
}
console.log(`${made} width(s) written`);
