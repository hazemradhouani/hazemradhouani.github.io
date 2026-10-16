// Deterministic background removal for drawings and isolated objects (D46, D49, D50).
// Pure functions on RGBA buffers (Uint8ClampedArray or Buffer, 4 bytes per pixel, row-major);
// tools/cutout.mjs decodes and encodes with ffmpeg. Nothing here invents a pixel: every output
// pixel is the source pixel, the source pixel unblended from its paper, or paper made clear.
//
// paper: [r, g, b] (a flat paper colour) or the fitted field returned by paperField().

const clamp255 = (v) => (v > 255 ? 255 : v < 0 ? 0 : v);

// The paper behind pixel p as [r, g, b]: flat, or the fitted quadratic field at (x, y).
function paperAt(paper, W, H) {
  if (Array.isArray(paper)) { const P = paper; return () => P; }
  const { coef } = paper; const out = [0, 0, 0];
  return (p) => {
    const x = (p % W) / W, y = Math.floor(p / W) / H;
    const t = [1, x, y, x * x, x * y, y * y];
    for (let c = 0; c < 3; c++) { let v = 0; for (let k = 0; k < 6; k++) v += coef[c][k] * t[k]; out[c] = v > 255 ? 255 : v < 1 ? 1 : v; }
    return out;
  };
}

// White-to-alpha against the paper: each channel balanced so the paper reads 255, alpha from the
// darkest channel, colour unblended (so it composites back to the source over white).
function key(r0, g0, b0, P) {
  const r = Math.min(255, r0 * 255 / P[0]), g = Math.min(255, g0 * 255 / P[1]), b = Math.min(255, b0 * 255 / P[2]);
  const a = (255 - Math.min(r, g, b)) / 255;
  return { r, g, b, a };
}
const soft = (a, floor, knee) => (a <= floor ? 0 : a >= knee ? a : a * (a - floor) / (knee - floor));

/** Fit a quadratic paper field per channel to the border band (for vignetted or uneven grounds). */
export function paperField(px, W, H, band = 0.03) {
  const bw = Math.max(2, Math.round(Math.min(W, H) * band));
  const step = Math.max(1, Math.floor(Math.sqrt((W * H) / 40000)));
  const A = Array.from({ length: 6 }, () => new Float64Array(6));
  const B = [new Float64Array(6), new Float64Array(6), new Float64Array(6)];
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
    if (x >= bw && x < W - bw && y >= bw && y < H - bw) continue;
    const i = (y * W + x) * 4; const u = x / W, v = y / H;
    const t = [1, u, v, u * u, u * v, v * v];
    for (let j = 0; j < 6; j++) { for (let k = 0; k < 6; k++) A[j][k] += t[j] * t[k]; for (let c = 0; c < 3; c++) B[c][j] += t[j] * px[i + c]; }
  }
  const solve = (M, rhs) => { // Gaussian elimination with partial pivoting on a copy
    const m = M.map((r) => Float64Array.from(r)); const b = Float64Array.from(rhs); const n = 6;
    for (let c = 0; c < n; c++) {
      let piv = c; for (let r = c + 1; r < n; r++) if (Math.abs(m[r][c]) > Math.abs(m[piv][c])) piv = r;
      [m[c], m[piv]] = [m[piv], m[c]]; [b[c], b[piv]] = [b[piv], b[c]];
      const d = m[c][c] || 1e-12;
      for (let r = c + 1; r < n; r++) { const f = m[r][c] / d; for (let k = c; k < n; k++) m[r][k] -= f * m[c][k]; b[r] -= f * b[c]; }
    }
    const x = new Float64Array(n);
    for (let r = n - 1; r >= 0; r--) { let s = b[r]; for (let k = r + 1; k < n; k++) s -= m[r][k] * x[k]; x[r] = s / (m[r][r] || 1e-12); }
    return [...x];
  };
  return { coef: B.map((rhs) => solve(A, rhs)) };
}

/** Ink mode: the whole sheet is paper plus ink. Writes unblended colour and graded alpha in place. */
export function keyInk(px, W, H, { paper, floor, knee }) {
  const P = paperAt(paper, W, H);
  for (let p = 0, i = 0; p < W * H; p++, i += 4) {
    const k = key(px[i], px[i + 1], px[i + 2], P(p));
    const a2 = soft(k.a, floor, knee);
    if (k.a > 0) { px[i] = clamp255(Math.round(255 - (255 - k.r) / k.a)); px[i + 1] = clamp255(Math.round(255 - (255 - k.g) / k.a)); px[i + 2] = clamp255(Math.round(255 - (255 - k.b) / k.a)); }
    else px[i] = px[i + 1] = px[i + 2] = 255;
    px[i + 3] = Math.round(a2 * 255);
  }
}

// 8-connected component labels over a boolean mask; returns { label, boxes }.
function components(mask, W, H) {
  const label = new Int32Array(W * H).fill(-1);
  const boxes = []; const stack = new Int32Array(W * H);
  let n = 0;
  for (let s = 0; s < W * H; s++) {
    if (!mask[s] || label[s] >= 0) continue;
    let top = 0; stack[top++] = s; label[s] = n;
    let x0 = W, y0 = H, x1 = -1, y1 = -1, area = 0;
    while (top) {
      const p = stack[--top]; const x = p % W, y = (p - x) / W; area++;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy; if (ny < 0 || ny >= H) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx; if (nx < 0 || nx >= W) continue;
          const q = ny * W + nx; if (mask[q] && label[q] < 0) { label[q] = n; stack[top++] = q; }
        }
      }
    }
    boxes.push({ x0, y0, x1, y1, area }); n++;
  }
  return { label, boxes };
}

/**
 * Annotation removal on blank paper (D49), run on the source before keying. A component of ink
 * (8-connected, above the noise floor) is removed only when its bounding box lies wholly inside a
 * declared rectangle; one that reaches outside (a line, a wall, a hatch) is kept and counted.
 * Removed pixels become pure white, which keys to clear. Returns one report per rectangle.
 */
export function eraseComponents(px, W, H, rects, { paper, floor }) {
  if (!rects?.length) return [];
  const P = paperAt(paper, W, H);
  const mask = new Uint8Array(W * H);
  for (let p = 0, i = 0; p < W * H; p++, i += 4) mask[p] = key(px[i], px[i + 1], px[i + 2], P(p)).a > floor ? 1 : 0;
  const { label, boxes } = components(mask, W, H);
  return rects.map((r) => {
    const rx1 = r.x + r.w - 1, ry1 = r.y + r.h - 1;
    const hit = new Set();
    for (let y = Math.max(0, r.y); y <= Math.min(H - 1, ry1); y++) for (let x = Math.max(0, r.x); x <= Math.min(W - 1, rx1); x++) { const l = label[y * W + x]; if (l >= 0) hit.add(l); }
    const inside = [...hit].filter((l) => { const b = boxes[l]; return b.x0 >= r.x && b.y0 >= r.y && b.x1 <= rx1 && b.y1 <= ry1; });
    const gone = new Set(inside);
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (const l of inside) { const b = boxes[l]; x0 = Math.min(x0, b.x0); y0 = Math.min(y0, b.y0); x1 = Math.max(x1, b.x1); y1 = Math.max(y1, b.y1); }
    for (let y = Math.max(0, r.y); y <= Math.min(H - 1, ry1); y++) for (let x = Math.max(0, r.x); x <= Math.min(W - 1, rx1); x++) {
      const p = y * W + x; if (gone.has(label[p])) { const i = p * 4; px[i] = px[i + 1] = px[i + 2] = 255; }
    }
    return { id: r.id, removed: inside.length, kept: hit.size - inside.length, bbox: inside.length ? { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 } : null };
  });
}

const inRects = (rects, x, y) => (rects || []).some((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);

/**
 * Object mode: only the paper connected to the sheet's border is background. A 4-connected flood from
 * the border (plus any `bg` rectangles) crosses pixels lighter than `tol` (alpha against the paper) and
 * flatter than `grad`, never entering `keep` rectangles. Background pixels and a `band`-px ring around
 * them are keyed like ink (soft shadows become translucent dark); everything enclosed stays opaque,
 * white-balanced to the same paper.
 */
export function objectMatte(px, W, H, { paper, floor, knee, tol = 0.25, grad = 0.12, keep = [], bg = [], band = 1 }) {
  const P = paperAt(paper, W, H);
  const N = W * H;
  const A = new Float32Array(N); const L = new Float32Array(N);
  for (let p = 0, i = 0; p < N; p++, i += 4) {
    const k = key(px[i], px[i + 1], px[i + 2], P(p));
    A[p] = k.a; L[p] = (0.2126 * k.r + 0.7152 * k.g + 0.0722 * k.b) / 255;
  }
  const G = (p) => { const x = p % W, y = (p - x) / W; const xl = x > 0 ? p - 1 : p, xr = x < W - 1 ? p + 1 : p, yu = y > 0 ? p - W : p, yd = y < H - 1 ? p + W : p; return Math.max(Math.abs(L[xr] - L[xl]), Math.abs(L[yd] - L[yu])); };
  const B = new Uint8Array(N); const queue = new Int32Array(N); let head = 0, tail = 0;
  const seed = (p) => { if (!B[p]) { B[p] = 1; queue[tail++] = p; } };
  for (let x = 0; x < W; x++) for (const y of [0, H - 1]) { const p = y * W + x; if (A[p] <= tol && !inRects(keep, x, y)) seed(p); }
  for (let y = 0; y < H; y++) for (const x of [0, W - 1]) { const p = y * W + x; if (A[p] <= tol && !inRects(keep, x, y)) seed(p); }
  for (const r of bg) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (x >= 0 && y >= 0 && x < W && y < H) seed(y * W + x);
  while (head < tail) {
    const p = queue[head++]; const x = p % W, y = (p - x) / W;
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const q = ny * W + nx;
      if (B[q] || A[q] > tol || G(q) > grad || inRects(keep, nx, ny)) continue;
      B[q] = 1; queue[tail++] = q;
    }
  }
  // the transition ring: non-background pixels within `band` px (Chebyshev) of the background
  const ring = new Uint8Array(N);
  if (band > 0) for (let p = 0; p < N; p++) {
    if (!B[p]) continue; const x = p % W, y = (p - x) / W;
    for (let dy = -band; dy <= band; dy++) for (let dx = -band; dx <= band; dx++) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const q = ny * W + nx; if (!B[q]) ring[q] = 1;
    }
  }
  for (let p = 0, i = 0; p < N; p++, i += 4) {
    const k = key(px[i], px[i + 1], px[i + 2], P(p));
    if (B[p] || ring[p]) {
      const a2 = soft(k.a, floor, knee);
      if (k.a > 0) { px[i] = clamp255(Math.round(255 - (255 - k.r) / k.a)); px[i + 1] = clamp255(Math.round(255 - (255 - k.g) / k.a)); px[i + 2] = clamp255(Math.round(255 - (255 - k.b) / k.a)); }
      else px[i] = px[i + 1] = px[i + 2] = 255;
      px[i + 3] = Math.round(a2 * 255);
    } else {
      px[i] = Math.round(k.r); px[i + 1] = Math.round(k.g); px[i + 2] = Math.round(k.b); px[i + 3] = 255;
    }
  }
  let background = 0; for (let p = 0; p < N; p++) background += B[p];
  return { background: background / N };
}

/** Remove faint isolated specks (JPEG noise): components no larger than `speck` px whose strongest alpha is below `faint`. */
export function despeckle(px, W, H, { speck = 4, faint = 0.3 } = {}) {
  if (!speck) return 0;
  const N = W * H; const mask = new Uint8Array(N);
  for (let p = 0; p < N; p++) mask[p] = px[p * 4 + 3] > 0 ? 1 : 0;
  const { label, boxes } = components(mask, W, H);
  const peak = new Uint8Array(boxes.length);
  for (let p = 0; p < N; p++) { const l = label[p]; if (l >= 0 && px[p * 4 + 3] > peak[l]) peak[l] = px[p * 4 + 3]; }
  const drop = boxes.map((b, l) => b.area <= speck && peak[l] < faint * 255);
  for (let p = 0; p < N; p++) { const l = label[p]; if (l >= 0 && drop[l]) { const i = p * 4; px[i] = px[i + 1] = px[i + 2] = 255; px[i + 3] = 0; } }
  return drop.filter(Boolean).length;
}

/** Sides of the image where visible ink touches the edge: the crop may have cut through the drawing. */
export function clippedSides(px, W, H, { alpha = 0.1 } = {}) {
  const t = alpha * 255; const hit = (x, y) => px[(y * W + x) * 4 + 3] > t;
  const sides = [];
  let s = false; for (let y = 0; y < H && !s; y++) s = hit(0, y); if (s) sides.push('left');
  s = false; for (let x = 0; x < W && !s; x++) s = hit(x, 0); if (s) sides.push('top');
  s = false; for (let y = 0; y < H && !s; y++) s = hit(W - 1, y); if (s) sides.push('right');
  s = false; for (let x = 0; x < W && !s; x++) s = hit(x, H - 1); if (s) sides.push('bottom');
  return sides;
}

/**
 * The dark scheme's "keep" layer (D69): the solid rendered regions of a keyed cutout (materials,
 * photographs, shaded models), opaque and in the colours they show over white, to lay over the
 * CSS-inverted drawing. Solid = alpha above `t` that survives an opening by a (2r+1) square, so
 * text, dimension lines and hatching stay with the inverted linework. With `fill`, regions the
 * solids enclose are kept too (white faces of a model, window frames in a rendered facade); without
 * it, gaps between members stay see-through (an open timber frame). The region's outermost pixels
 * keep the cutout's own graded alpha, so the seam over the inverted drawing has no hard edge.
 * Returns the layer (RGBA, same size, transparent elsewhere) and the share of pixels kept.
 */
export function keepLayer(px, W, H, { radius = 4, t = 0.06, fill = true } = {}) {
  const N = W * H, r = radius;
  const M = new Uint8Array(N); for (let p = 0; p < N; p++) M[p] = px[p * 4 + 3] > t * 255 ? 1 : 0;
  // separable binary erosion (every pixel of the window set) or dilation (any set); outside the image is empty
  const pass = (src, horizontal, all) => {
    const out = new Uint8Array(N); const len = horizontal ? W : H, lines = horizontal ? H : W;
    const pre = new Int32Array(len + 1);
    for (let l = 0; l < lines; l++) {
      for (let i = 0; i < len; i++) pre[i + 1] = pre[i] + src[horizontal ? l * W + i : i * W + l];
      for (let i = 0; i < len; i++) {
        const s = pre[Math.min(len - 1, i + r) + 1] - pre[Math.max(0, i - r)];
        out[horizontal ? l * W + i : i * W + l] = all ? (s === 2 * r + 1 ? 1 : 0) : (s > 0 ? 1 : 0);
      }
    }
    return out;
  };
  const O = pass(pass(pass(pass(M, true, true), false, true), true, false), false, false);
  // outside = not solid and (with fill) connected to the border; without fill, simply not solid
  const B = new Uint8Array(N);
  if (fill) {
    const q = new Int32Array(N); let head = 0, tail = 0;
    const seed = (p) => { if (!O[p] && !B[p]) { B[p] = 1; q[tail++] = p; } };
    for (let x = 0; x < W; x++) { seed(x); seed((H - 1) * W + x); }
    for (let y = 0; y < H; y++) { seed(y * W); seed(y * W + W - 1); }
    while (head < tail) { const p = q[head++]; const x = p % W; if (x > 0) seed(p - 1); if (x < W - 1) seed(p + 1); if (p >= W) seed(p - W); if (p < N - W) seed(p + W); }
  } else for (let p = 0; p < N; p++) B[p] = O[p] ? 0 : 1;
  const out = Buffer.alloc(N * 4); let kept = 0;
  for (let p = 0; p < N; p++) {
    if (B[p]) continue; kept++;
    const i = p * 4, x = p % W;
    const edge = (x > 0 && B[p - 1]) || (x < W - 1 && B[p + 1]) || (p >= W && B[p - W]) || (p < N - W && B[p + W]);
    if (edge) { out.set(px.subarray(i, i + 4), i); continue; }
    const a = px[i + 3] / 255;
    for (let c = 0; c < 3; c++) out[i + c] = Math.round(a * px[i + c] + (1 - a) * 255);
    out[i + 3] = 255;
  }
  return { layer: out, share: kept / N };
}

// sRGB 8-bit -> OKLab chroma
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
function chroma(r, g, b) {
  const R = lin(r), G = lin(g), Bl = lin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * Bl);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * Bl);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * Bl);
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return Math.hypot(a, bb);
}

/**
 * Classify a keyed cutout for its dark-scheme treatment (D50). Measured on the ink as it appears
 * over white, averaged over 2x2 blocks so JPEG chroma ringing around black lines does not count.
 * mono: greyscale linework (invert); accent: neutral ink with thin colour (invert-accent);
 * colour: colour carries meaning (inspection field).
 */
export function classifyInk(px, W, H, { chromaMin = 0.035, mono = 0.003, accent = 0.06 } = {}) {
  let ink = 0, chromatic = 0, mid = 0;
  for (let y = 0; y + 1 < H; y += 2) for (let x = 0; x + 1 < W; x += 2) {
    let r = 0, g = 0, b = 0, aSum = 0;
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      const i = ((y + dy) * W + x + dx) * 4; const a = px[i + 3] / 255;
      r += px[i] * a + 255 * (1 - a); g += px[i + 1] * a + 255 * (1 - a); b += px[i + 2] * a + 255 * (1 - a); aSum += a;
    }
    if (aSum / 4 <= 0.06) continue;
    ink++;
    if (aSum / 4 > 0.2 && aSum / 4 < 0.8) mid++;
    if (chroma(r / 4, g / 4, b / 4) > chromaMin) chromatic++;
  }
  const frac = ink ? chromatic / ink : 0;
  return { ink, chromaticFraction: +frac.toFixed(4), midtoneFraction: ink ? +(mid / ink).toFixed(4) : 0, suggest: frac < mono ? 'mono' : frac < accent ? 'accent' : 'colour' };
}
