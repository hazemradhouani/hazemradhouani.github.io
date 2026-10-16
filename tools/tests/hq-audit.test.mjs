import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  inventoryImages,
  validateAuditInventory,
  validateAuditDocument,
  validateProductionManifest,
} from '../hq-audit.mjs';

const tmpDirs = [];

test.afterEach(() => {
  while (tmpDirs.length) fs.rmSync(tmpDirs.pop(), { recursive: true, force: true });
});

function tempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hq-audit-'));
  tmpDirs.push(dir);
  return dir;
}

function pngFixture() {
  const png = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(png);
  png.writeUInt32BE(13, 8);
  png.write('IHDR', 12);
  png.writeUInt32BE(17, 16);
  png.writeUInt32BE(9, 20);
  return png;
}

function jpegFixture() {
  return Buffer.from([
    0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x07, 0x00, 0x0b, 0x03,
    0x01, 0x11, 0x00, 0x02, 0x11, 0x00, 0x03, 0x11, 0x00, 0xff, 0xd9,
  ]);
}

function auditAsset(overrides = {}) {
  return {
    source: 'Images HQ/Ain Sbaa/Scene 69.png',
    sha256: '8ec18cb1d97e9fa1012472229f253013b0d207928718f6c3d5867bbf19695edf',
    width: 17,
    height: 9,
    projectMapping: { slug: 'ain-sebaa', status: 'provisional' },
    mappingEvidence: 'Folder name matches the existing Aïn Sebaâ case-study label; visual review is pending.',
    visualType: 'render',
    textDisposition: 'none',
    duplicateOf: null,
    disposition: 'withheld',
    authorizationEvidence: 'owner-direct:2026-10-13',
    creditEvidence: 'not established',
    roleEvidence: 'not established',
    reason: 'Not selected until visible credit, role and caption evidence are reviewed together.',
    ...overrides,
  };
}

function auditDocument(assets) {
  return {
    version: 1,
    sourceRoot: 'Images HQ',
    inventoryCount: assets.length,
    assets,
  };
}

function mediaAsset(overrides = {}) {
  return {
    source: 'Images HQ/Ain Sbaa/Scene 69.png',
    output: 'images/ain-sebaa/scene-69.png',
    sha256: '8ec18cb1d97e9fa1012472229f253013b0d207928718f6c3d5867bbf19695edf',
    crop: null,
    treatment: 'source-preserving',
    darkTreatment: 'preserve-colour-scene',
    credit: 'Source credit verified in case-study evidence.',
    authorizationEvidence: 'owner-direct:2026-10-13',
    captionEvidence: 'Existing Aïn Sebaâ caption and source reviewed against this full scene.',
    reviewStatus: 'approved',
    ...overrides,
  };
}

test('inventory reads supported images with slash-separated paths, hashes and source dimensions', () => {
  const root = tempDir();
  const source = path.join(root, 'Images HQ');
  fs.mkdirSync(path.join(source, 'Ain Sbaa'), { recursive: true });
  fs.mkdirSync(path.join(source, 'Zenata'), { recursive: true });
  fs.writeFileSync(path.join(source, 'Ain Sbaa', 'Scene 69.png'), pngFixture());
  fs.writeFileSync(path.join(source, 'Zenata', 'Scene 13.JPG'), jpegFixture());
  fs.writeFileSync(path.join(source, 'ignore.gif'), Buffer.from('not supported'));

  assert.deepEqual(inventoryImages(source, { sourcePrefix: 'Images HQ' }), [
    {
      source: 'Images HQ/Ain Sbaa/Scene 69.png',
      sha256: '8ec18cb1d97e9fa1012472229f253013b0d207928718f6c3d5867bbf19695edf',
      width: 17,
      height: 9,
    },
    {
      source: 'Images HQ/Zenata/Scene 13.JPG',
      sha256: '446e70015de8de364751e6c3cf0bcc6165186931ae2c8beeddf5c254a1bd5732',
      width: 11,
      height: 7,
    },
  ]);
});

test('inventory includes dot-prefixed .trashed source images', () => {
  const root = tempDir();
  const source = path.join(root, 'Images HQ');
  fs.mkdirSync(path.join(source, 'Cinema'), { recursive: true });
  fs.writeFileSync(path.join(source, 'Cinema', '.trashed-1762728296-Scene 2.png'), pngFixture());

  const inventory = inventoryImages(source, { sourcePrefix: 'Images HQ' });
  assert.equal(inventory.length, 1);
  assert.equal(inventory[0].source, 'Images HQ/Cinema/.trashed-1762728296-Scene 2.png');
  assert.equal(inventory[0].width, 17);
  assert.equal(inventory[0].height, 9);
});

test('audit schema rejects every missing required asset field and an inventory-count mismatch', () => {
  const required = [
    'source', 'sha256', 'width', 'height', 'projectMapping', 'mappingEvidence', 'visualType',
    'textDisposition', 'duplicateOf', 'disposition', 'authorizationEvidence', 'creditEvidence',
    'roleEvidence', 'reason',
  ];
  for (const field of required) {
    const asset = auditAsset();
    delete asset[field];
    assert.ok(
      validateAuditDocument(auditDocument([asset])).some((error) => error.includes(`assets[0].${field} is required`)),
      `expected ${field} to be mandatory`,
    );
  }

  const badCount = auditDocument([auditAsset()]);
  badCount.inventoryCount = 2;
  assert.ok(validateAuditDocument(badCount).some((error) => error.includes('inventoryCount must equal assets.length')));
});

test('audit inventory rejects a source that no longer matches the immutable HQ library', () => {
  const root = tempDir();
  const source = path.join(root, 'Images HQ');
  fs.mkdirSync(path.join(source, 'Ain Sbaa'), { recursive: true });
  fs.writeFileSync(path.join(source, 'Ain Sbaa', 'Scene 69.png'), pngFixture());

  const inventory = inventoryImages(source, { sourcePrefix: 'Images HQ' });
  const audit = auditDocument([auditAsset({
    source: inventory[0].source,
    sha256: '0000000000000000000000000000000000000000000000000000000000000000',
    width: inventory[0].width,
    height: inventory[0].height,
  })]);

  assert.ok(
    validateAuditInventory(audit, inventory).some((error) => error.includes('sha256 does not match source inventory')),
  );
});

test('production manifest source is refused until the matching audit entry is approved with established evidence', () => {
  const audit = auditDocument([auditAsset()]);
  const manifest = { version: 1, sourceRoot: 'Images HQ', assets: [mediaAsset()] };
  assert.ok(
    validateProductionManifest(manifest, audit).some((error) => error.includes('must reference an approved audit entry')),
  );

  audit.assets[0] = auditAsset({
    disposition: 'approved',
    creditEvidence: 'Studio BELEM credit verified in the supplied source.',
    roleEvidence: 'Existing Aïn Sebaâ case-study evidence establishes the owner\'s role.',
  });
  assert.deepEqual(validateProductionManifest(manifest, audit), []);
});

test('production manifest refuses a long-edge cap that is not a positive integer (it would write a 1x1 master)', () => {
  const audit = auditDocument([auditAsset({
    disposition: 'approved',
    creditEvidence: 'Studio BELEM credit verified in the supplied source.',
    roleEvidence: 'Existing Aïn Sebaâ case-study evidence establishes the owner\'s role.',
  })]);
  for (const maxEdge of [null, 0, -5, 12.5, '1200']) {
    const errors = validateProductionManifest({ version: 1, sourceRoot: 'Images HQ', assets: [mediaAsset({ maxEdge })] }, audit);
    assert.ok(errors.some((error) => error.includes('maxEdge must be a positive integer')), `maxEdge ${JSON.stringify(maxEdge)}`);
  }
  assert.deepEqual(validateProductionManifest({ version: 1, sourceRoot: 'Images HQ', assets: [mediaAsset({ maxEdge: 1200 })] }, audit), []);
});

test('production manifest rejects an incomplete derivative recipe', () => {
  const audit = auditDocument([auditAsset({
    disposition: 'approved',
    creditEvidence: 'Studio BELEM credit verified in the supplied source.',
    roleEvidence: 'Existing Aïn Sebaâ case-study evidence establishes the owner\'s role.',
  })]);
  const incomplete = mediaAsset();
  delete incomplete.captionEvidence;
  assert.ok(
    validateProductionManifest({ version: 1, sourceRoot: 'Images HQ', assets: [incomplete] }, audit)
      .some((error) => error.includes('assets[0].captionEvidence is required')),
  );
});

test('production manifest refuses an unresolved caption or a non-approved review state', () => {
  const audit = auditDocument([auditAsset({
    disposition: 'approved',
    projectMapping: { slug: 'ain-sebaa', status: 'confirmed' },
    textDisposition: 'no-text',
    visualType: 'render',
    creditEvidence: 'Studio BELEM credit verified in the supplied source.',
    roleEvidence: 'Existing Aïn Sebaâ case-study evidence establishes the owner\'s role.',
  })]);
  const unresolved = mediaAsset({
    credit: 'not established',
    captionEvidence: 'review-required',
    reviewStatus: 'pending',
  });
  const errors = validateProductionManifest({ version: 1, sourceRoot: 'Images HQ', assets: [unresolved] }, audit);

  assert.ok(errors.some((error) => error.includes('credit must be established')));
  assert.ok(errors.some((error) => error.includes('captionEvidence must be established')));
  assert.ok(errors.some((error) => error.includes('reviewStatus must be approved')));
});
