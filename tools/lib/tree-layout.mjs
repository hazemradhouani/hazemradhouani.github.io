// The index tree's leaves, placed at build time (D110): one canvas 1200 units wide (the tree's width; 1.147px a
// unit at 1440), the family pills on the left, the leaves in the field to their right. Every leaf has the same
// area at its own ratio, except where that would make its short side thinner than MIN (a long section or
// elevation is raised to it). Leaves are packed in rows in their given order, so reading and focus order follow
// the page, and the row's spare width and the canvas's spare height are shared out by a seeded random draw:
// the field looks scattered, never overlaps, and is the same on every build.
export const TREE = {
  W: 1200,      // canvas width in units
  H0: 600,      // the smallest canvas: one screen, with the pills at its middle
  HMAX: 1200,   // the tallest: about 1.6 screens at 1440 x 900
  X0: 420,      // the field's left edge, clear of the widest family pill at 64rem
  PAD: 12,      // the field's margin inside the canvas
  GAP: 14,      // the least space between two leaves
  FILL: 0.32,   // the share of the field the leaves cover
  AMAX: 10000,  // the largest leaf area (a few leaves do not become posters)
  MIN: 35,      // the least short side: 40px at 1440
};

// mulberry32: a small seeded generator, enough for placement
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// `total` shared out over `k` slots by random weights
const share = (total, k, rand) => { const w = Array.from({ length: k }, () => 0.25 + rand()); const s = w.reduce((a, b) => a + b, 0); return w.map((x) => (total * x) / s); };

function sizes(ratios, a, { MIN }) {
  return ratios.map((r) => {
    let w = Math.sqrt(a * r), h = Math.sqrt(a / r);
    const k = MIN / Math.min(w, h);
    if (k > 1) { w *= k; h *= k; }
    return { w, h };
  });
}
function rows(ss, width, gap) {
  const out = [[]]; let used = 0;
  ss.forEach((s, i) => {
    const row = out.at(-1);
    if (row.length && used + gap + s.w > width) { out.push([i]); used = s.w; } else { row.push(i); used += (row.length > 1 ? gap : 0) + s.w; }
  });
  return out;
}
const heightOf = (rs, ss, gap) => rs.reduce((t, r) => t + Math.max(...r.map((i) => ss[i].h)), 0) + gap * (rs.length - 1);

/** ratios: each leaf's width / height, in page order. Returns the canvas height and each leaf's box, in units. */
export function placeLeaves(ratios, { seed = 1, ...opt } = {}) {
  const T = { ...TREE, ...opt };
  const n = ratios.length;
  if (!n) return { h: T.H0, leaves: [] };
  const fw = T.W - T.X0 - T.PAD;
  const H = Math.min(T.HMAX, Math.max(T.H0, Math.ceil((n * T.AMAX) / (T.FILL * fw))));
  const fh = H - 2 * T.PAD;
  let a = Math.min(T.AMAX, (T.FILL * fw * fh) / n);
  let ss, rs;
  for (let i = 0; ; i++) {
    ss = sizes(ratios, a, T);
    if (ss.some((s) => s.w > fw)) throw new Error(`tree-layout: a leaf of ratio ${Math.max(...ratios).toFixed(2)} is wider than the field at its least height`);
    rs = rows(ss, fw, T.GAP);
    if (heightOf(rs, ss, T.GAP) <= fh) break;
    if (i > 200) throw new Error(`tree-layout: ${n} leaves do not fit a ${fw} x ${fh} field`);
    a *= 0.97;
  }
  const rand = rng(seed);
  const leaves = new Array(n);
  const tops = share(fh - heightOf(rs, ss, T.GAP), rs.length + 1, rand);
  let y = T.PAD;
  rs.forEach((r, k) => {
    // a row's band is its tallest leaf plus the spare height above it; each leaf drops anywhere in the band, so
    // the rows do not read as rows
    const band = tops[k], rh = Math.max(...r.map((i) => ss[i].h)) + band;
    const gaps = share(fw - r.reduce((t, i) => t + ss[i].w, 0) - T.GAP * (r.length - 1), r.length + 1, rand);
    let x = T.X0;
    r.forEach((i, j) => {
      x += gaps[j] + (j ? T.GAP : 0);
      const round = (v) => Math.round(v * 10) / 10;
      leaves[i] = { x: round(x), y: round(y + rand() * (rh - ss[i].h)), w: round(ss[i].w), h: round(ss[i].h) };
      x += ss[i].w;
    });
    y += rh + T.GAP;
  });
  return { h: H, area: a, leaves };
}

// a connector from a pill's anchor to a leaf's left middle: it leaves and arrives level, as dmcg's do
export const connector = (from, l) => {
  const tx = l.x, ty = Math.round((l.y + l.h / 2) * 10) / 10, mx = Math.round((from.x + (tx - from.x) * 0.45) * 10) / 10;
  return `M${from.x} ${from.y}C${mx} ${from.y} ${mx} ${ty} ${tx} ${ty}`;
};
