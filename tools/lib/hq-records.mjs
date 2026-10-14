// The two committed HQ records, stored as one file per owner so parallel work never shares a file (D52):
//   docs/flagship/hq-audit/<folder>.json  — the source audit, one file per Images HQ top-level folder
//   tools/hq-media/<slug>.json            — the production recipes, one file per case study
// Both load as the single documents that tools/hq-audit.mjs validates.
import fs from 'node:fs';
import path from 'node:path';

export const SOURCE_PREFIX = 'Images HQ';

// "Images HQ/Villneuve la garenne/x.jpg" -> "Villneuve la garenne"
export function topFolder(source) {
  const prefix = `${SOURCE_PREFIX}/`;
  return source.startsWith(prefix) ? source.slice(prefix.length).split('/')[0] : null;
}

// "Villneuve la garenne" -> "villneuve-la-garenne.json" (the audit file name)
export const folderFile = (folder) => `${folder.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/gu, '').replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '')}.json`;

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const jsonFiles = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort() : []);
const bySource = (a, b) => (a.source < b.source ? -1 : a.source > b.source ? 1 : 0);

/** The whole audit as one document: every folder file's assets, sorted by source path. */
export function loadAudit(dir) {
  const assets = [];
  for (const f of jsonFiles(dir)) {
    const doc = readJson(path.join(dir, f));
    if (doc.version !== 1 || doc.sourceRoot !== SOURCE_PREFIX || !Array.isArray(doc.assets)) throw new Error(`${f}: not an HQ audit folder record`);
    for (const a of doc.assets) {
      const home = folderFile(topFolder(a.source) || '');
      if (home !== f) throw new Error(`${f}: ${a.source} belongs in ${home}`);
      assets.push(a);
    }
  }
  assets.sort(bySource);
  return { version: 1, sourceRoot: SOURCE_PREFIX, inventoryCount: assets.length, assets };
}

/** Write the audit back as one file per top-level folder (stable order, trailing newline). */
export function writeAudit(dir, audit) {
  const groups = new Map();
  for (const a of audit.assets) {
    const f = folderFile(topFolder(a.source));
    if (!groups.has(f)) groups.set(f, []);
    groups.get(f).push(a);
  }
  fs.mkdirSync(dir, { recursive: true });
  for (const [f, assets] of groups) {
    const doc = { version: 1, sourceRoot: SOURCE_PREFIX, folder: topFolder(assets[0].source), assets: assets.sort(bySource) };
    fs.writeFileSync(path.join(dir, f), `${JSON.stringify(doc, null, 2)}\n`);
  }
}

/** Every per-project recipe file as one manifest. */
export function loadManifest(dir) {
  const assets = [];
  for (const f of jsonFiles(dir)) {
    const doc = readJson(path.join(dir, f));
    if (doc.version !== 1 || doc.sourceRoot !== SOURCE_PREFIX || !Array.isArray(doc.assets)) throw new Error(`${f}: not an HQ production manifest`);
    assets.push(...doc.assets);
  }
  return { version: 1, sourceRoot: SOURCE_PREFIX, assets };
}
