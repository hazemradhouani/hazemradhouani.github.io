import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { importMedia, targetSize, validateImportPlan } from '../import-hq-media.mjs';

const tmpDirs = [];

test.afterEach(() => {
  while (tmpDirs.length) fs.rmSync(tmpDirs.pop(), { recursive: true, force: true });
});

function tempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hq-import-'));
  tmpDirs.push(dir);
  return dir;
}

function sha(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function approvedAudit(source, digest) {
  return {
    version: 1,
    sourceRoot: 'Images HQ',
    inventoryCount: 1,
    assets: [{
      source,
      sha256: digest,
      width: 17,
      height: 9,
      projectMapping: { slug: 'demo', status: 'confirmed' },
      mappingEvidence: 'A reviewed, existing demo case study.',
      visualType: 'render',
      textDisposition: 'no-text',
      duplicateOf: null,
      disposition: 'approved',
      authorizationEvidence: 'owner-direct:2026-10-13',
      creditEvidence: 'Studio Example credit is present in the verified case-study record.',
      roleEvidence: 'Existing case-study record establishes the portfolio owner’s role.',
      reason: 'Approved as an exact scene replacement after visual comparison.',
    }],
  };
}

function manifest(source, digest, overrides = {}) {
  return {
    version: 1,
    sourceRoot: 'Images HQ',
    assets: [{
      source,
      output: 'images/demo/scene-hq.jpg',
      sha256: digest,
      crop: null,
      treatment: 'source-preserving exact copy',
      darkTreatment: 'preserve-colour-scene',
      credit: 'Render: Studio Example',
      authorizationEvidence: 'owner-direct:2026-10-13',
      captionEvidence: 'Exact visual match to the existing reviewed demo-scene caption and credit.',
      reviewStatus: 'approved',
      ...overrides,
    }],
  };
}

function fixture() {
  const root = tempDir();
  const source = 'Images HQ/Demo/scene.jpg';
  const bytes = Buffer.from('immutable high-resolution source fixture');
  const sourceFile = path.join(root, ...source.split('/'));
  fs.mkdirSync(path.dirname(sourceFile), { recursive: true });
  fs.writeFileSync(sourceFile, bytes);
  return { root, source, bytes, digest: sha(bytes) };
}

test('the import plan accepts an approved exact-copy source and only a safe declared output', () => {
  const { root, source, digest } = fixture();
  const errors = validateImportPlan({
    root,
    audit: approvedAudit(source, digest),
    manifest: manifest(source, digest),
  });
  assert.deepEqual(errors, []);
});

test('the import plan rejects a changed source hash, an out-of-bounds crop, and a path outside images', () => {
  const { root, source, digest } = fixture();
  const changed = manifest(source, '0'.repeat(64));
  const changedErrors = validateImportPlan({ root, audit: approvedAudit(source, digest), manifest: changed });
  assert.ok(changedErrors.some((error) => error.includes('does not match the immutable source')));

  const crop = manifest(source, digest, { crop: { x: 16, y: 0, width: 2, height: 9 } });
  const cropErrors = validateImportPlan({ root, audit: approvedAudit(source, digest), manifest: crop });
  assert.ok(cropErrors.some((error) => error.includes('exceeds the approved source dimensions')));

  const escaped = manifest(source, digest, { output: 'images/../outside.jpg' });
  const pathErrors = validateImportPlan({ root, audit: approvedAudit(source, digest), manifest: escaped });
  assert.ok(pathErrors.some((error) => error.includes('must stay inside images/')));
});

test('the importer copies an approved no-crop master byte-for-byte without changing its source', () => {
  const { root, source, bytes, digest } = fixture();
  const audit = approvedAudit(source, digest);
  const media = manifest(source, digest);
  const result = importMedia({ root, audit, manifest: media });
  const output = path.join(root, 'images', 'demo', 'scene-hq.jpg');

  assert.equal(result.imported, 1);
  assert.deepEqual(fs.readFileSync(output), bytes);
  assert.deepEqual(fs.readFileSync(path.join(root, ...source.split('/'))), bytes);
});

test('masters are capped at 2560 px, drawings also at 6 MP, never enlarged (D51, D55)', () => {
  assert.deepEqual(targetSize(5760, 3240, 'jpg'), { width: 2560, height: 1440, scaled: true });
  assert.deepEqual(targetSize(4060, 5413, 'jpg'), { width: 1920, height: 2560, scaled: true });
  assert.deepEqual(targetSize(9038, 1342, 'png'), { width: 2560, height: 380, scaled: true });
  assert.deepEqual(targetSize(14044, 9934, 'png'), { width: 2560, height: 1811, scaled: true });
  assert.deepEqual(targetSize(3000, 3000, 'png'), { width: 2449, height: 2449, scaled: true });
  assert.deepEqual(targetSize(800, 600, 'jpg'), { width: 800, height: 600, scaled: false });
  assert.deepEqual(targetSize(3000, 1000, 'jpg', 1200), { width: 1200, height: 400, scaled: true });
});

test('an oversized source is area-downscaled after its crop, into a real image of the capped size', () => {
  const root = tempDir();
  const source = 'Images HQ/Demo/big.png';
  const sourceFile = path.join(root, ...source.split('/'));
  fs.mkdirSync(path.dirname(sourceFile), { recursive: true });
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=3200x1400', '-frames:v', '1', sourceFile]);
  const digest = sha(fs.readFileSync(sourceFile));
  const audit = approvedAudit(source, digest);
  Object.assign(audit.assets[0], { width: 3200, height: 1400 });
  const media = manifest(source, digest, { output: 'images/demo/big-crop.jpg', crop: { x: 100, y: 0, width: 3000, height: 1400 } });
  importMedia({ root, audit, manifest: media });
  const out = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,pix_fmt', '-of', 'csv=p=0',
    path.join(root, 'images', 'demo', 'big-crop.jpg')]).toString().trim();
  assert.equal(out, '2560,1195,yuvj444p');
});

test('the importer refuses to overwrite an output whose bytes differ from the declared recipe', () => {
  const { root, source, digest } = fixture();
  const audit = approvedAudit(source, digest);
  const media = manifest(source, digest);
  const output = path.join(root, 'images', 'demo', 'scene-hq.jpg');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, 'different old derivative');

  assert.throws(
    () => importMedia({ root, audit, manifest: media }),
    /refusing to overwrite/u,
  );
});

test('a crop of a 4:2:0 JPEG keeps its exact odd size (cropped in RGB, not on chroma pairs)', () => {
  const root = tempDir();
  const source = 'Images HQ/Demo/sheet.jpg';
  const sourceFile = path.join(root, ...source.split('/'));
  fs.mkdirSync(path.dirname(sourceFile), { recursive: true });
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=900x600', '-pix_fmt', 'yuvj420p', '-frames:v', '1', sourceFile]);
  const digest = sha(fs.readFileSync(sourceFile));
  const audit = approvedAudit(source, digest);
  Object.assign(audit.assets[0], { width: 900, height: 600 });
  importMedia({ root, audit, manifest: manifest(source, digest, { output: 'images/demo/odd.png', crop: { x: 11, y: 7, width: 301, height: 205 } }) });
  const out = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path.join(root, 'images', 'demo', 'odd.png')]).toString().trim();
  assert.equal(out, '301,205');
});
