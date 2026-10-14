// Cutout settings: tools/cutout.json (defaults and the original drawings) merged with one file per
// case study in tools/cutout.d/<slug>.json (D52), so parallel work never edits a shared file.
// Each file may hold: extra [src], exclude {src: reason}, images {src: options}, fullBleed {src: reason}.
// A source may be configured in only one file.
import fs from 'node:fs';
import path from 'node:path';

export function loadCutoutConfig(root) {
  const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
  const base = read('tools/cutout.json');
  const conf = { defaults: base.defaults || {}, extra: [...(base.extra || [])], exclude: { ...base.exclude }, images: { ...base.images }, fullBleed: { ...base.fullBleed }, files: ['tools/cutout.json'] };
  const dir = path.join(root, 'tools/cutout.d');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort() : [];
  for (const f of files) {
    const rel = `tools/cutout.d/${f}`; const doc = read(rel);
    for (const key of ['exclude', 'images', 'fullBleed']) for (const [src, v] of Object.entries(doc[key] || {})) {
      if (src in conf[key]) throw new Error(`${rel}: ${key} for ${src} is already set in another cutout file`);
      conf[key][src] = v;
    }
    for (const src of doc.extra || []) if (!conf.extra.includes(src)) conf.extra.push(src);
    conf.files.push(rel);
  }
  return conf;
}

// newest modification time of any cutout settings file (a changed setting makes cutouts stale)
export const configTime = (root, conf) => Math.max(...conf.files.map((f) => fs.statSync(path.join(root, f)).mtimeMs));
