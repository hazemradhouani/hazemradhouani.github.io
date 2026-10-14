#!/usr/bin/env node
// Inventory and validate the immutable user-provided Images HQ library.
// The tool never changes a source image. `--write` only refreshes the committed audit record.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAudit, loadManifest, writeAudit as writeAuditFolders } from './lib/hq-records.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_ROOT = path.join(ROOT, 'Images HQ');
const SOURCE_PREFIX = 'Images HQ';
// one audit file per Images HQ folder and one recipe file per case study (D52)
const AUDIT_DIR = path.join(ROOT, 'docs', 'flagship', 'hq-audit');
const MANIFEST_DIR = path.join(ROOT, 'tools', 'hq-media');
const IMAGE_EXTENSION = /\.(?:jpe?g|png)$/iu;

const REQUIRED_AUDIT_FIELDS = [
  'source', 'sha256', 'width', 'height', 'projectMapping', 'mappingEvidence', 'visualType',
  'textDisposition', 'duplicateOf', 'disposition', 'authorizationEvidence', 'creditEvidence',
  'roleEvidence', 'reason',
];

const REQUIRED_MANIFEST_FIELDS = [
  'source', 'output', 'sha256', 'crop', 'treatment', 'darkTreatment', 'credit',
  'authorizationEvidence', 'captionEvidence', 'reviewStatus',
];

const FOLDER_MAPPINGS = {
  'Ain Sbaa': {
    slug: 'ain-sebaa',
    evidence: 'Brief 10 maps the source folder to the existing Aïn Sebaâ case study; the individual source still needs a visual and caption comparison.',
  },
  BELHOMME: {
    slug: 'belhomme',
    evidence: 'Brief 10 maps the BELHOMME source folder to the existing Belhomme case study; the individual source still needs a visual and caption comparison.',
  },
  BOLIVAR: {
    slug: 'bolivar',
    evidence: 'Brief 10 maps the BOLIVAR source folder to the existing Bolívar case study; the individual source still needs a visual and caption comparison.',
  },
  Cinema: {
    slug: 'cinephile',
    evidence: 'Brief 10 maps the Cinema source folder to the existing Cinephile case study; the individual source still needs a visual and caption comparison.',
  },
  'EL erg': {
    slug: 'al-arg',
    evidence: 'Brief 10 records the nonliteral EL erg to Al-Arg mapping; the individual source still needs a visual and caption comparison.',
  },
  FOUBERT: {
    slug: 'foubert',
    evidence: 'Brief 10 maps the FOUBERT source folder to the existing Foubert case study; the individual source still needs a visual and caption comparison.',
  },
  Guerite: {
    slug: 'sentry',
    evidence: 'Brief 10 maps the Guerite source folder to the existing Sentry case study; the individual source still needs a visual and caption comparison.',
  },
  Hospital: {
    slug: 'tamansourt',
    evidence: 'Brief 10 maps the Hospital source folder to the existing Tamansourt case study; the individual source still needs a visual and caption comparison.',
  },
  'La villette': {
    slug: 'la-villette',
    evidence: 'Brief 10 maps the La villette source folder to the existing La Villette case study; the individual source still needs a visual and caption comparison.',
  },
  'Nouvelle Medina': {
    slug: 'nouvelle-medina',
    evidence: 'Brief 10 maps the Nouvelle Medina source folder to the existing Nouvelle Medina case study; the individual source still needs a visual and caption comparison.',
  },
  'Station Hay Mohammadi': {
    slug: 'hay-mohammadi',
    evidence: 'Brief 10 maps the Station Hay Mohammadi source folder to the existing Hay Mohammadi case study; the individual source still needs a visual and caption comparison.',
  },
  Tabarka: {
    slug: 'corallum',
    evidence: 'Brief 10 maps the Tabarka source folder to the existing Corallum case study; the individual source still needs a visual and caption comparison.',
  },
  VILLAS: {
    slug: 'papillon',
    evidence: 'Brief 10 maps the VILLAS source folder to the existing Villa Papillon case study; the individual source still needs a visual and caption comparison.',
  },
  Zenata: {
    slug: 'zenata',
    evidence: 'Brief 10 maps the Zenata source folder to the existing Zenata case study; the individual source still needs a visual and caption comparison.',
  },
};

function sourcePath(prefix, segments) {
  return [prefix.replace(/[\\/]+$/u, ''), ...segments].join('/');
}

function sourceFolder(source, sourcePrefix = SOURCE_PREFIX) {
  const prefix = `${sourcePrefix.replace(/[\\/]+$/u, '')}/`;
  if (!source.startsWith(prefix)) return null;
  return source.slice(prefix.length).split('/')[0] || null;
}

function imageDimensions(bytes, source) {
  if (bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    if (bytes.subarray(12, 16).toString('ascii') !== 'IHDR') throw new Error(`Invalid PNG header: ${source}`);
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }

  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset < bytes.length) {
      if (bytes[offset] !== 0xff) { offset++; continue; }
      while (bytes[offset] === 0xff) offset++;
      const marker = bytes[offset++];
      if (marker == null || marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 2 > bytes.length) break;
      const length = bytes.readUInt16BE(offset);
      if (length < 2 || offset + length > bytes.length) break;
      const sof = (marker >= 0xc0 && marker <= 0xc3)
        || (marker >= 0xc5 && marker <= 0xc7)
        || (marker >= 0xc9 && marker <= 0xcb)
        || (marker >= 0xcd && marker <= 0xcf);
      if (sof) {
        if (length < 7) break;
        return { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) };
      }
      offset += length;
    }
  }

  throw new Error(`Unable to read PNG/JPEG dimensions: ${source}`);
}

function walkImages(directory, sourcePrefix, segments = []) {
  const entries = fs.readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const images = [];
  for (const entry of entries) {
    const nextSegments = [...segments, entry.name];
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      images.push(...walkImages(absolute, sourcePrefix, nextSegments));
    } else if (entry.isFile() && IMAGE_EXTENSION.test(entry.name)) {
      const bytes = fs.readFileSync(absolute);
      const { width, height } = imageDimensions(bytes, sourcePath(sourcePrefix, nextSegments));
      images.push({
        source: sourcePath(sourcePrefix, nextSegments),
        sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
        width,
        height,
      });
    }
  }
  return images;
}

/** Read every supported image, including dot-prefixed recoverable files, without changing the library. */
export function inventoryImages(directory, { sourcePrefix = SOURCE_PREFIX } = {}) {
  if (!fs.existsSync(directory)) throw new Error(`HQ source library is missing: ${directory}`);
  return walkImages(directory, sourcePrefix).sort((a, b) => (a.source < b.source ? -1 : a.source > b.source ? 1 : 0));
}

function defaultMapping(source) {
  const folder = sourceFolder(source);
  if (folder === 'Memoire') {
    return {
      slug: null,
      status: 'unresolved',
      evidence: 'Brief 10 keeps Memoire unpublished pending a verified title, author and relationship to the portfolio owner.',
    };
  }
  if (folder === 'Villneuve la garenne') {
    return {
      slug: null,
      status: 'unresolved',
      evidence: 'Brief 10 identifies a Studio BELEM permit-stage proposal but does not establish the portfolio owner’s personal role or a publishable case-study relationship.',
    };
  }
  const mapping = FOLDER_MAPPINGS[folder];
  if (!mapping) {
    return {
      slug: null,
      status: 'unresolved',
      evidence: 'No verified project mapping is recorded for this source folder.',
    };
  }
  return { slug: mapping.slug, status: 'provisional', evidence: mapping.evidence };
}

function defaultVisualType(source) {
  const file = path.posix.basename(source).toLowerCase();
  if (/(?:scene|render|perspective|cam-|ext court|panoramic)/u.test(file)) return 'render';
  if (/(?:clay|stone wall|normal map|roughness|spec(?:ular)?|\bord\b)/u.test(file)) return 'material-texture';
  if (/(?:plan|coupe|facade|section|site|structure|flux|function|map|time|level|height|cover|sketch|open|a0|pc\d|page-)/u.test(file)) return 'drawing-or-sheet';
  return 'unreviewed';
}

export function defaultAuditAsset(image) {
  const mapping = defaultMapping(image.source);
  const unresolvedProject = mapping.status === 'unresolved';
  return {
    source: image.source,
    sha256: image.sha256,
    width: image.width,
    height: image.height,
    projectMapping: { slug: mapping.slug, status: mapping.status },
    mappingEvidence: mapping.evidence,
    visualType: defaultVisualType(image.source),
    textDisposition: 'review-required',
    duplicateOf: null,
    disposition: unresolvedProject ? 'unresolved' : 'withheld',
    authorizationEvidence: 'owner-direct:2026-10-13',
    creditEvidence: 'not established',
    roleEvidence: 'not established',
    reason: unresolvedProject
      ? 'Withheld because the supplied material does not establish a publishable project relationship or personal role.'
      : 'Withheld pending individual visual review, visible credit review, role evidence and a confirmed existing-case-study caption match.',
  };
}

export function makeAuditDocument(inventory, previousAudit = null) {
  const previous = new Map((previousAudit?.assets ?? []).map((asset) => [asset.source, asset]));
  const assets = inventory.map((image) => {
    const old = previous.get(image.source);
    if (old && old.sha256 === image.sha256 && old.width === image.width && old.height === image.height) {
      return { ...old, source: image.source, sha256: image.sha256, width: image.width, height: image.height };
    }
    return defaultAuditAsset(image);
  });
  return { version: 1, sourceRoot: SOURCE_PREFIX, inventoryCount: assets.length, assets };
}

function requiredFields(value, fields, pathLabel, errors) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${pathLabel} must be an object`);
    return false;
  }
  for (const field of fields) if (!(field in value)) errors.push(`${pathLabel}.${field} is required`);
  return true;
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function establishedEvidence(value) {
  if (!nonEmptyString(value)) return false;
  return !new Set(['not established', 'review-required', 'review required', 'unresolved', 'pending'])
    .has(value.trim().toLowerCase());
}

/** Validate the committed source audit schema without reading source images. */
export function validateAuditDocument(document) {
  const errors = [];
  if (!requiredFields(document, ['version', 'sourceRoot', 'inventoryCount', 'assets'], 'audit', errors)) return errors;
  if (document.version !== 1) errors.push('audit.version must be 1');
  if (document.sourceRoot !== SOURCE_PREFIX) errors.push(`audit.sourceRoot must be ${SOURCE_PREFIX}`);
  if (!Number.isInteger(document.inventoryCount) || document.inventoryCount < 0) errors.push('audit.inventoryCount must be a non-negative integer');
  if (!Array.isArray(document.assets)) {
    errors.push('audit.assets must be an array');
    return errors;
  }
  if (document.inventoryCount !== document.assets.length) errors.push('audit.inventoryCount must equal assets.length');
  const seen = new Set();
  for (const [index, asset] of document.assets.entries()) {
    const label = `assets[${index}]`;
    if (!requiredFields(asset, REQUIRED_AUDIT_FIELDS, label, errors)) continue;
    if (!nonEmptyString(asset.source) || asset.source.includes('\\') || !asset.source.startsWith(`${SOURCE_PREFIX}/`)) errors.push(`${label}.source must be a slash-separated Images HQ path`);
    if (!/^[a-f0-9]{64}$/iu.test(asset.sha256)) errors.push(`${label}.sha256 must be a SHA-256 hex digest`);
    if (!Number.isInteger(asset.width) || asset.width < 1) errors.push(`${label}.width must be a positive integer`);
    if (!Number.isInteger(asset.height) || asset.height < 1) errors.push(`${label}.height must be a positive integer`);
    if (!asset.projectMapping || typeof asset.projectMapping !== 'object' || Array.isArray(asset.projectMapping)) {
      errors.push(`${label}.projectMapping must be an object`);
    } else {
      const { slug, status } = asset.projectMapping;
      if (slug !== null && !nonEmptyString(slug)) errors.push(`${label}.projectMapping.slug must be a slug or null`);
      if (!['provisional', 'confirmed', 'unresolved'].includes(status)) errors.push(`${label}.projectMapping.status must be provisional, confirmed or unresolved`);
      if (slug === null && status !== 'unresolved') errors.push(`${label}.projectMapping with no slug must be unresolved`);
    }
    for (const field of ['mappingEvidence', 'visualType', 'textDisposition', 'authorizationEvidence', 'creditEvidence', 'roleEvidence', 'reason']) {
      if (!nonEmptyString(asset[field])) errors.push(`${label}.${field} must be a non-empty string`);
    }
    if (asset.duplicateOf !== null && (!nonEmptyString(asset.duplicateOf) || asset.duplicateOf.includes('\\') || !asset.duplicateOf.startsWith(`${SOURCE_PREFIX}/`))) errors.push(`${label}.duplicateOf must be null or a slash-separated Images HQ path`);
    if (!['approved', 'withheld', 'unresolved'].includes(asset.disposition)) errors.push(`${label}.disposition must be approved, withheld or unresolved`);
    if (seen.has(asset.source)) errors.push(`${label}.source duplicates another audit record`);
    seen.add(asset.source);
  }
  return errors;
}

/** Compare the source audit to the current immutable image inventory. */
export function validateAuditInventory(audit, inventory) {
  const errors = [];
  const auditBySource = new Map((audit?.assets ?? []).map((asset) => [asset.source, asset]));
  const inventoryBySource = new Map(inventory.map((image) => [image.source, image]));
  if (audit?.inventoryCount !== inventory.length) errors.push(`audit inventoryCount (${audit?.inventoryCount}) does not match source inventory (${inventory.length})`);
  for (const image of inventory) {
    const asset = auditBySource.get(image.source);
    if (!asset) {
      errors.push(`audit is missing source inventory record: ${image.source}`);
      continue;
    }
    for (const field of ['sha256', 'width', 'height']) if (asset[field] !== image[field]) errors.push(`${image.source}: ${field} does not match source inventory`);
  }
  for (const asset of audit?.assets ?? []) if (!inventoryBySource.has(asset.source)) errors.push(`audit records a source not present in the library: ${asset.source}`);
  return errors;
}

/** Validate a production recipe and prove every selection is already authorised in the audit. */
export function validateProductionManifest(document, audit) {
  const errors = [];
  if (!requiredFields(document, ['version', 'sourceRoot', 'assets'], 'manifest', errors)) return errors;
  if (document.version !== 1) errors.push('manifest.version must be 1');
  if (document.sourceRoot !== SOURCE_PREFIX) errors.push(`manifest.sourceRoot must be ${SOURCE_PREFIX}`);
  if (!Array.isArray(document.assets)) {
    errors.push('manifest.assets must be an array');
    return errors;
  }
  const auditBySource = new Map((audit?.assets ?? []).map((asset) => [asset.source, asset]));
  const outputs = new Set();
  for (const [index, media] of document.assets.entries()) {
    const label = `assets[${index}]`;
    if (!requiredFields(media, REQUIRED_MANIFEST_FIELDS, label, errors)) continue;
    if (!nonEmptyString(media.source) || media.source.includes('\\') || !media.source.startsWith(`${SOURCE_PREFIX}/`)) errors.push(`${label}.source must be a slash-separated Images HQ path`);
    if (!nonEmptyString(media.output) || media.output.includes('\\') || !/^images\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:[a-z0-9-]*)(?:\.(?:jpe?g|png))$/u.test(media.output)) errors.push(`${label}.output must be a stable lowercase images path`);
    if (!/^[a-f0-9]{64}$/iu.test(media.sha256)) errors.push(`${label}.sha256 must be a SHA-256 hex digest`);
    if (media.crop !== null) {
      if (!media.crop || typeof media.crop !== 'object' || Array.isArray(media.crop)) {
        errors.push(`${label}.crop must be null or a source-pixel crop object`);
      } else {
        for (const field of ['x', 'y', 'width', 'height']) if (!Number.isInteger(media.crop[field]) || media.crop[field] < (field === 'width' || field === 'height' ? 1 : 0)) errors.push(`${label}.crop.${field} must be a valid source-pixel integer`);
      }
    }
    for (const field of ['treatment', 'darkTreatment', 'credit', 'authorizationEvidence', 'captionEvidence', 'reviewStatus']) if (!nonEmptyString(media[field])) errors.push(`${label}.${field} must be a non-empty string`);
    if (!establishedEvidence(media.credit)) errors.push(`${label}.credit must be established before publication`);
    if (!establishedEvidence(media.captionEvidence)) errors.push(`${label}.captionEvidence must be established before publication`);
    if (media.reviewStatus !== 'approved') errors.push(`${label}.reviewStatus must be approved before publication`);
    if (outputs.has(media.output)) errors.push(`${label}.output duplicates another production recipe`);
    outputs.add(media.output);

    const source = auditBySource.get(media.source);
    if (!source || source.disposition !== 'approved' || !establishedEvidence(source.authorizationEvidence) || !establishedEvidence(source.creditEvidence) || !establishedEvidence(source.roleEvidence)) {
      errors.push(`${label} must reference an approved audit entry with established authorization, credit and role evidence`);
      continue;
    }
    if (source.sha256 !== media.sha256) errors.push(`${label}.sha256 does not match the approved audit entry`);
    if (source.authorizationEvidence !== media.authorizationEvidence) errors.push(`${label}.authorizationEvidence must match the approved audit entry`);
    if (media.crop && Number.isInteger(media.crop.x) && Number.isInteger(media.crop.y) && Number.isInteger(media.crop.width) && Number.isInteger(media.crop.height)
      && (media.crop.x + media.crop.width > source.width || media.crop.y + media.crop.height > source.height)) errors.push(`${label}.crop exceeds the approved source dimensions`);
  }
  return errors;
}

export function checkFiles({ auditDir = AUDIT_DIR, manifestDir = MANIFEST_DIR, sourceRoot = SOURCE_ROOT } = {}) {
  const inventory = inventoryImages(sourceRoot, { sourcePrefix: SOURCE_PREFIX });
  const audit = loadAudit(auditDir);
  const manifest = loadManifest(manifestDir);
  return [
    ...validateAuditDocument(audit),
    ...validateAuditInventory(audit, inventory),
    ...validateProductionManifest(manifest, audit),
  ];
}

function writeAudit() {
  const inventory = inventoryImages(SOURCE_ROOT, { sourcePrefix: SOURCE_PREFIX });
  const audit = makeAuditDocument(inventory, loadAudit(AUDIT_DIR));
  writeAuditFolders(AUDIT_DIR, audit);
  return audit;
}

function runCli() {
  const args = process.argv.slice(2);
  if (args.length !== 1 || !['--check', '--write'].includes(args[0])) {
    throw new Error('Usage: node tools/hq-audit.mjs --check | --write');
  }
  if (args[0] === '--write') {
    const audit = writeAudit();
    console.log(`Wrote ${audit.inventoryCount} HQ source records to docs/flagship/hq-audit/`);
  }
  const errors = checkFiles();
  if (errors.length) throw new Error(`HQ audit validation failed:\n- ${errors.join('\n- ')}`);
  const audit = loadAudit(AUDIT_DIR);
  const manifest = loadManifest(MANIFEST_DIR);
  console.log(`HQ audit valid: ${audit.inventoryCount} source record(s), ${manifest.assets.length} production recipe(s)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    runCli();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
