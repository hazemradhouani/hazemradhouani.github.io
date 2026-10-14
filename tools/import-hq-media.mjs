#!/usr/bin/env node
// Import an approved HQ source into a stable published path without touching Images HQ/.
// A manifest entry is an exact byte copy, or a deterministic rectangular source-pixel crop and/or an
// area downscale to the master cap (D51), encoded explicitly.
// Usage: node tools/import-hq-media.mjs --check | --write [--replace] [--only=images/<slug>/]
//   --replace  rewrite an output whose bytes no longer match its (changed) recipe, and say so
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateProductionManifest } from './hq-audit.mjs';
import { loadAudit, loadManifest } from './lib/hq-records.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_PREFIX = 'Images HQ';
const AUDIT_DIR = path.join(ROOT, 'docs', 'flagship', 'hq-audit');
const MANIFEST_DIR = path.join(ROOT, 'tools', 'hq-media');

const digest = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const contains = (root, target) => target === root || target.startsWith(`${root}${path.sep}`);

function sourcePath(root, source) {
  const sourceRoot = path.resolve(root, SOURCE_PREFIX);
  const target = path.resolve(root, ...source.split('/'));
  return contains(sourceRoot, target) ? target : null;
}

function outputPath(root, output) {
  const imagesRoot = path.resolve(root, 'images');
  const target = path.resolve(root, ...output.split('/'));
  return contains(imagesRoot, target) ? target : null;
}

function planEntry(media, auditBySource, root, index) {
  const label = `assets[${index}]`;
  const source = sourcePath(root, media.source || '');
  const output = outputPath(root, media.output || '');
  const approved = auditBySource.get(media.source);
  const errors = [];
  if (!source) errors.push(`${label}.source must stay inside Images HQ/`);
  if (!output) errors.push(`${label}.output must stay inside images/`);
  if (source && !fs.existsSync(source)) errors.push(`${label}.source does not exist in the immutable HQ library`);
  if (source && fs.existsSync(source) && digest(source) !== media.sha256) errors.push(`${label}.sha256 does not match the immutable source`);
  if (approved && media.crop && (
    media.crop.x + media.crop.width > approved.width
    || media.crop.y + media.crop.height > approved.height
  )) errors.push(`${label}.crop exceeds the approved source dimensions`);
  return { errors, source, output };
}

/** Confirm that the manifest remains an approved, reproducible import plan. */
export function validateImportPlan({ root = ROOT, audit, manifest }) {
  const errors = [...validateProductionManifest(manifest, audit)];
  const auditBySource = new Map((audit?.assets || []).map((asset) => [asset.source, asset]));
  for (const [index, media] of (manifest?.assets || []).entries()) {
    errors.push(...planEntry(media, auditBySource, root, index).errors);
  }
  return errors;
}

// Master caps (D51, D55): 2560 px on the long edge covers a full-width figure at 2x and is the most the
// site ever serves (the viewer uses the largest derivative); a drawing (PNG) is also held to 6 MP.
const CAPS = { jpg: { edge: 2560, pixels: Infinity }, png: { edge: 2560, pixels: 6e6 } };
// bump when the rendering of a recipe changes, so cached outputs are rebuilt
const RECIPE_VERSION = 2;
const kindOf = (file) => (/\.png$/iu.test(file) ? 'png' : 'jpg');

/** The size a master is written at: the source (or crop) scaled down to its cap, never enlarged. */
export function targetSize(width, height, ext, maxEdge = Infinity) {
  const cap = CAPS[ext];
  const k = Math.min(1, Math.min(cap.edge, maxEdge) / Math.max(width, height), Math.sqrt(cap.pixels / (width * height)));
  if (k >= 1) return { width, height, scaled: false };
  return { width: Math.max(1, Math.round(width * k)), height: Math.max(1, Math.round(height * k)), scaled: true };
}

// Encoders are explicit so a master never inherits ffmpeg's default (soft) JPEG quality:
// renders as 4:4:4 JPEG at q 2, drawings as lossless RGB PNG (no HQ source carries real alpha).
const ENCODE = {
  jpg: ['-pix_fmt', 'yuvj444p', '-q:v', '2'],
  png: ['-pix_fmt', 'rgb24', '-compression_level', '9'],
};

function makeDerivative({ source, output, crop, size }) {
  const sameKind = kindOf(source) === kindOf(output);
  if (!crop && !size.scaled && sameKind) return fs.readFileSync(source);
  const filters = [];
  // full-resolution RGB first: a 4:2:0 JPEG is otherwise cropped on even pixels only
  if (crop) filters.push('format=rgb24', `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`);
  if (size.scaled) filters.push(`scale=${size.width}:${size.height}:flags=area`);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hq-import-'));
  const rendered = path.join(dir, path.basename(output));
  try {
    execFileSync('ffmpeg', [
      '-v', 'error', '-y', '-i', source,
      ...(filters.length ? ['-vf', filters.join(',')] : []),
      ...ENCODE[kindOf(output)],
      '-frames:v', '1', rendered,
    ]);
    return fs.readFileSync(rendered);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Write only approved manifest outputs. Existing output bytes must already match the exact recipe.
 * Returns import counts so --check can assert no stale or missing production master remains.
 */
export function importMedia({ root = ROOT, audit, manifest, check = false, replace = false, only = null }) {
  const errors = validateImportPlan({ root, audit, manifest });
  if (errors.length) throw new Error(`HQ import validation failed:\n- ${errors.join('\n- ')}`);

  // Re-rendering a 50 MB board on every check is slow: a local cache maps each recipe to the bytes it
  // produced, and a matching output is accepted without rendering again (tools/.cache is gitignored).
  const cacheFile = path.join(root, 'tools', '.cache', 'hq-import.json');
  const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) : {};
  const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
  const auditBySource = new Map(audit.assets.map((asset) => [asset.source, asset]));
  let imported = 0;
  let current = 0;
  let replaced = 0;
  for (const [index, media] of manifest.assets.entries()) {
    if (only && !media.output.startsWith(only)) continue;
    const { source, output } = planEntry(media, auditBySource, root, index);
    const from = media.crop || auditBySource.get(media.source);
    const size = targetSize(from.width, from.height, kindOf(output), media.maxEdge);
    const recipe = sha(JSON.stringify([RECIPE_VERSION, media.sha256, media.crop, size, ENCODE[kindOf(output)], kindOf(media.source)]));
    const exists = fs.existsSync(output);
    if (exists && cache[media.output]?.recipe === recipe && cache[media.output].output === sha(fs.readFileSync(output))) { current++; continue; }
    const bytes = makeDerivative({ source, output, crop: media.crop, size });
    cache[media.output] = { recipe, output: sha(bytes) };
    if (exists) {
      if (fs.readFileSync(output).equals(bytes)) { current++; continue; }
      if (!replace || check) throw new Error(`assets[${index}] refusing to overwrite ${media.output}: existing bytes differ from its declared recipe (re-run with --write --replace if the recipe changed on purpose)`);
      fs.writeFileSync(output, bytes);
      console.log(`replaced ${media.output} (${size.width}x${size.height})`);
      replaced++;
      continue;
    }
    if (check) throw new Error(`assets[${index}] is missing declared production output: ${media.output}`);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, bytes);
    imported++;
  }
  fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
  fs.writeFileSync(cacheFile, `${JSON.stringify(cache, null, 1)}\n`);
  return { imported, current, replaced };
}

function runCli() {
  const args = process.argv.slice(2);
  const mode = args.find((a) => a === '--check' || a === '--write');
  const only = args.find((a) => a.startsWith('--only='))?.slice('--only='.length);
  if (!mode || args.some((a) => !['--check', '--write', '--replace'].includes(a) && !a.startsWith('--only='))) {
    throw new Error('Usage: node tools/import-hq-media.mjs --check | --write [--replace] [--only=images/<slug>/]');
  }
  const audit = loadAudit(AUDIT_DIR);
  const manifest = loadManifest(MANIFEST_DIR);
  const result = importMedia({ audit, manifest, check: mode === '--check', replace: args.includes('--replace'), only });
  console.log(`HQ media ${mode === '--check' ? 'checked' : 'imported'}: ${result.current} current, ${result.imported} written${result.replaced ? `, ${result.replaced} replaced` : ''}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    runCli();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
