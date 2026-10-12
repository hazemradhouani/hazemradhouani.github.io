// Tagged-template HTML with escaping by default. raw() marks trusted markup.
export class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
export const raw = (s) => new Raw(String(s ?? ''));
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
const val = (v) => (v == null || v === false ? '' : Array.isArray(v) ? v.map(val).join('') : v instanceof Raw ? v.s : esc(v));
export const html = (strings, ...vals) => raw(strings.reduce((a, s, i) => a + s + (i < vals.length ? val(vals[i]) : ''), ''));
export const attrs = (o) => raw(Object.entries(o)
  .filter(([, v]) => v != null && v !== false && v !== '')
  .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`)).join(''));
export const when = (c, f) => (c ? f() : '');
// Inline text: escape, then allow *italic* and [label](url) written in content files.
export const inline = (s) => raw(esc(s)
  .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => `<a href="${u}">${t}</a>`));
