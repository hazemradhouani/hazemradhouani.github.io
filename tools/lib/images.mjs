// Image facts read from the files themselves (no dependencies): pixel size of JPEG/PNG
// sources and the AVIF/WebP derivatives that exist in images/opt.
import fs from 'node:fs';
import path from 'node:path';
import { html, attrs } from './html.mjs';

let ROOT = process.cwd();
export const setRoot = (r) => { ROOT = r; };
const cache = new Map();

export function dims(rel) {
  if (cache.has(rel)) return cache.get(rel);
  const b = fs.readFileSync(path.join(ROOT, rel));
  let d = null;
  if (b[0] === 0x89 && b[1] === 0x50) d = { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  else if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if ((m >= 0xc0 && m <= 0xc3) || (m >= 0xc5 && m <= 0xc7) || (m >= 0xc9 && m <= 0xcb) || (m >= 0xcd && m <= 0xcf)) {
        d = { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) }; break;
      }
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  if (!d) throw new Error(`Cannot read dimensions of ${rel}`);
  cache.set(rel, d);
  return d;
}

// images/al-arg/La villette_page-0001.jpg -> images/opt/al-arg/la-villette-page-0001
export function optStem(rel) {
  const dir = path.posix.dirname(rel).replace(/^images\/?/, '');
  const stem = path.posix.basename(rel, path.posix.extname(rel)).toLowerCase().replace(/[\s_]+/g, '-');
  return path.posix.join('images/opt', dir, stem);
}

export function variants(rel) {
  const stem = optStem(rel);
  const dir = path.join(ROOT, path.posix.dirname(stem));
  if (!fs.existsSync(dir)) return [];
  const base = path.posix.basename(stem);
  const pre = `${base}-`;
  return fs.readdirSync(dir)
    .filter((f) => f.startsWith(pre) && f.endsWith('.avif'))
    .map((f) => f.slice(pre.length, -'.avif'.length))
    .filter((s) => s.length > 0 && [...s].every((c) => c >= '0' && c <= '9'))
    .map(Number)
    .filter((w) => fs.existsSync(path.join(dir, `${base}-${w}.webp`))).sort((a, b) => a - b);
}

// <picture> with AVIF + WebP sources, the original as fallback, real width/height.
export function picture(rel, { alt, sizes = '100vw', loading = 'lazy', priority = false, prefix = '', cls, style } = {}) {
  if (alt == null) throw new Error(`Missing alt for ${rel}`);
  const { w, h } = dims(rel);
  const ws = variants(rel);
  const set = (ext) => ws.map((x) => `${prefix}${optStem(rel)}-${x}.${ext} ${x}w`).join(', ');
  // alt is always written, even when empty: alt="" marks a decorative image (WCAG 1.1.1)
  return html`<picture${attrs({ class: cls, style })}>${ws.length ? html`<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">` : ''}<img src="${prefix + rel}" alt="${alt}"${attrs({
    width: w, height: h, loading: priority ? 'eager' : loading, fetchpriority: priority ? 'high' : null, decoding: priority ? null : 'async' })}></picture>`;
}

// largest derivative of each format, for the full-size viewer
export function largest(rel, prefix = '') {
  const ws = variants(rel); const top = ws[ws.length - 1];
  return top ? { avif: `${prefix}${optStem(rel)}-${top}.avif`, webp: `${prefix}${optStem(rel)}-${top}.webp` } : { avif: '', webp: '' };
}
