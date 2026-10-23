import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { opening } from '../templates/partials.mjs';
import { project } from '../templates/pages.mjs';

// The case-study opening (D115) and its de-duplication (D116), on the real content
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const projects = fs.readdirSync(path.join(ROOT, 'content/projects')).map((f) => read(`content/projects/${f}`)).sort((a, b) => a.order - b.order);
const by = Object.fromEntries(projects.map((x) => [x.slug, x]));
const ctx = { prefix: '../', films: read('content/pages/motion.json').films, reel: read('content/pages/home.json').reel, ogFor: () => 'images/og/home.jpg' };
const site = read('content/site.json');

test('the opening frame: 16:9, a panorama its own ratio up to 2.4:1, a portrait with its partner', () => {
  const al = opening(by['al-arg'], ctx);
  assert.equal(al.ar, 16 / 9); assert.equal(al.partner, null); assert.equal(al.nw, 2560);
  assert.equal(opening(by['hay-mohammadi'], ctx).ar, 2.4, 'a 2.85:1 panorama is cut to 2.4:1, no further');
  const bel = opening(by.belhomme, ctx);
  assert.equal(bel.ar, 16 / 9); assert.ok(bel.partner, 'a portrait hero keeps its partner');
  assert.equal(bel.nw, null, 'a pair has no single pixel width to cap it');
  assert.equal((String(bel.html).match(/class="op__f" data-crop/gu) || []).length, 2);
});

test('$omit leaves a repeated field out of the page, and an unknown entry fails the build', () => {
  const x = by.zenata;
  const body = String(project(site, x, projects, ctx).body);
  assert.ok(!body.includes(x.run), 'the run line is left out');
  assert.ok(!body.includes('<dt>Type</dt>') && !body.includes('<dt>Office</dt>'), 'omitted facts are left out');
  assert.ok(body.includes('<dt>Surface</dt>'), 'the other facts stay');
  assert.throws(() => project(site, { ...x, $omit: ['spec:Nope'] }, projects, ctx), /\$omit "spec:Nope"/u);
  assert.throws(() => project(site, { ...x, $omit: ['summary'] }, projects, ctx), /\$omit "summary"/u);
});
