// Image facts read from the files themselves (no dependencies): pixel size of JPEG/PNG
// sources and the AVIF/WebP derivatives that exist in images/opt.
import fs from 'node:fs';
import path from 'node:path';
import { html, attrs, when } from './html.mjs';

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

// Transparent cutout of a drawing (tools/cutout.mjs): images/x/y.jpg -> images/cut/x/y.png
export const cutFor = (rel) => path.posix.join('images/cut', path.posix.dirname(rel).replace(/^images\/?/, ''),
  path.posix.basename(rel, path.posix.extname(rel)) + '.png');
// The file to show: the cutout when the image is a drawing and its cutout exists, else the master.
export const shown = (rel, drawing) => (drawing && fs.existsSync(path.join(ROOT, cutFor(rel))) ? cutFor(rel) : rel);

// The dark-scheme treatment of a shown file (D50): a cutout's reviewed choice from its sidecar
// ('invert' | 'invert-accent' | 'field' | 'object'), the inspection field until one is chosen,
// and null for anything that is not a cutout (renders and photographs are never changed).
export function darkOf(rel) {
  if (!rel.startsWith('images/cut/')) return null;
  const side = path.join(ROOT, rel.replace(/\.png$/u, '.json'));
  const dark = fs.existsSync(side) ? JSON.parse(fs.readFileSync(side, 'utf8')).dark : null;
  return ['invert', 'invert-accent', 'field', 'object'].includes(dark) ? dark : 'field';
}

// PNG colour types 4 (grey + alpha) and 6 (RGBA) carry an alpha channel
export function hasAlpha(rel) {
  const b = fs.readFileSync(path.join(ROOT, rel));
  return b[0] === 0x89 && b[1] === 0x50 && (b[25] === 4 || b[25] === 6);
}

// derivative widths and the formats present for each (alpha images have WebP only, D31)
function scan(rel) {
  const stem = optStem(rel);
  const dir = path.join(ROOT, path.posix.dirname(stem));
  if (!fs.existsSync(dir)) return { ws: [], avif: false };
  const base = path.posix.basename(stem);
  const pre = `${base}-`;
  // An interrupted ffmpeg process can leave an empty output path behind. A file name alone is not
  // a valid responsive source: omit it so the media builder regenerates that width next time.
  const usable = (file) => fs.statSync(path.join(dir, file)).size > 0;
  const ws = fs.readdirSync(dir)
    .filter((f) => f.startsWith(pre) && f.endsWith('.webp') && usable(f))
    .map((f) => f.slice(pre.length, -'.webp'.length))
    .filter((s) => s.length > 0 && [...s].every((c) => c >= '0' && c <= '9'))
    .map(Number).sort((a, b) => a - b);
  return { ws, avif: ws.length > 0 && ws.every((w) => {
    const file = `${base}-${w}.avif`;
    return fs.existsSync(path.join(dir, file)) && usable(file);
  }) };
}
export const variants = (rel) => scan(rel).ws;

// <picture> with AVIF (when present) + WebP sources, the original as fallback, real width/height.
export function picture(rel, { alt, sizes = '100vw', loading = 'lazy', priority = false, prefix = '', cls, style } = {}) {
  if (alt == null) throw new Error(`Missing alt for ${rel}`);
  const { w, h } = dims(rel);
  const { ws, avif } = scan(rel);
  const set = (ext) => ws.map((x) => `${prefix}${optStem(rel)}-${x}.${ext} ${x}w`).join(', ');
  // alt is always written, even when empty: alt="" marks a decorative image (WCAG 1.1.1)
  return html`<picture${attrs({ class: cls, style })}>${when(avif, () => html`<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">`)}${when(ws.length, () => html`<source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">`)}<img src="${prefix + rel}" alt="${alt}"${attrs({
    width: w, height: h, loading: priority ? 'eager' : loading, fetchpriority: priority ? 'high' : null, decoding: priority ? null : 'async' })}></picture>`;
}

// largest derivative of each format, for the full-size viewer
export function largest(rel, prefix = '') {
  const { ws, avif } = scan(rel); const top = ws[ws.length - 1];
  return top ? { avif: avif ? `${prefix}${optStem(rel)}-${top}.avif` : '', webp: `${prefix}${optStem(rel)}-${top}.webp` } : { avif: '', webp: '' };
}

// preload hint for the LCP image, in the best format it has
export function preloadFor(rel, sizes, prefix = '') {
  const { ws, avif } = scan(rel);
  if (!ws.length) return '';
  const ext = avif ? 'avif' : 'webp';
  return html`<link rel="preload" as="image" type="image/${ext}" imagesrcset="${ws.map((w) => `${prefix}${optStem(rel)}-${w}.${ext} ${w}w`).join(', ')}" imagesizes="${sizes}" fetchpriority="high">`;
}
