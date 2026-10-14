import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const json = (rel) => JSON.parse(read(rel));

const supersededIdentity = /architect\s+speciali[sz]ing\s+in\s+heritage\s+documentation\s+and\s+earthen(?:\/vernacular)?\s+architecture/iu;
const japanAsPractice = /professional practice across paris, casablanca, and tokyo/iu;
const identity = 'Architect with project work in Tunisia, France and Morocco, and research experience in Japan.';

test('the active identity describes documented project work and research without a specialisation claim', () => {
  const site = json('content/site.json');
  const home = json('content/pages/home.json');
  const about = json('content/pages/about.json');
  const research = json('content/pages/research.json');
  const active = [
    read('CLAUDE.md'),
    JSON.stringify(site),
    JSON.stringify(home),
    JSON.stringify(about),
    JSON.stringify(research),
    read('tools/build.mjs'),
    read('index.html'),
    read('about.html'),
    read('books.html')
  ];

  assert.equal(site.person.line, identity);
  assert.match(home.description, /project work in Tunisia, France and Morocco/u);
  assert.match(about.bio, /research experience in Japan/u);
  assert.equal(research.report.subtitle, 'Professional practice in Paris and Casablanca; research in Japan');
  assert(active.every((text) => !supersededIdentity.test(text)), 'a current source or generated page retains the superseded specialisation');
  assert(active.every((text) => !japanAsPractice.test(text)), 'a current source or generated page presents Japan as professional practice');
});

test('person structured data derives truthful knowledge areas from content instead of a hard-coded specialisation', () => {
  const site = json('content/site.json');
  const build = read('tools/build.mjs');
  assert.ok(Array.isArray(site.person.knowsAbout));
  assert.ok(site.person.knowsAbout.includes('BIM'));
  assert.ok(site.person.knowsAbout.includes('Architectural visualisation'));
  assert.ok(!site.person.knowsAbout.includes('Earthen architecture'));
  assert.ok(!site.person.knowsAbout.includes('Vernacular architecture'));
  assert.match(build, /knowsAbout:\s*site\.person\.knowsAbout/u);
});

test('content coverage treats JSON-LD-only knowledge areas as metadata rather than visible page copy', () => {
  const qa = read('tools/qa.mjs');
  assert.match(qa, /'knowsAbout'/u);
});

test('the site-wide person record has no unused strengths field that can drift from visible content', () => {
  const site = json('content/site.json');
  assert.equal(site.person.strengths, undefined);
});
