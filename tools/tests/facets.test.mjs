import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { surfaceOf, yearsOf, facetsOf, facetRows } from '../templates/pages.mjs';

// The Index's filters (D125): facets come from project content only, on the real content
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const site = read('content/site.json');
const projects = fs.readdirSync(path.join(ROOT, 'content/projects')).map((f) => read(`content/projects/${f}`));

test('a surface in m², its thousands grouped by any space; hectares × 10 000', () => {
  assert.equal(surfaceOf('900 m²'), 900);
  assert.equal(surfaceOf('2 800 m²'), 2800);
  assert.equal(surfaceOf('7 200 m²'), 7200);
  assert.equal(surfaceOf('45 000 m²'), 45000);
  assert.equal(surfaceOf('Village: 1.4 ha'), 14000);
  for (const v of ['Small scale', 'about 900 m²', '1,4 ha', '900']) assert.throws(() => surfaceOf(v), /unparsable surface/, v);
});

test('a year range holds every year in it', () => {
  assert.deepEqual(yearsOf('2025'), ['2025']);
  assert.deepEqual(yearsOf('2023-2024'), ['2023', '2024']);
  for (const v of ['2026-2025', 'March 2025', '25']) assert.throws(() => yearsOf(v), /unparsable year/, v);
});

test('every project: a country of site.json places, known tags, one practice', () => {
  for (const x of projects) assert.doesNotThrow(() => facetsOf(x, site), x.slug);
  const x = projects[0];
  assert.throws(() => facetsOf({ ...x, country: 'Japan' }, site), /country/);
  assert.throws(() => facetsOf({ ...x, filters: [...x.filters, 'museum'] }, site), /unknown tag/);
  assert.throws(() => facetsOf({ ...x, filters: ['professional', 'academic'] }, site), /one practice/);
  assert.throws(() => facetsOf({ ...x, spec: [{ label: 'Surface', value: 'large' }] }, site), /surface/);
});

test('the counts: places 3/5/7, types, bands 8/3/2 (two in none), practice 12/3, none above the projects', () => {
  const F = projects.map((x) => facetsOf(x, site));
  const n = (k, v) => F.filter((f) => f[k].includes(v)).length;
  assert.deepEqual(['tunisia', 'france', 'morocco'].map((v) => n('place', v)), [3, 5, 7]);
  assert.deepEqual(['heritage', 'new-build', 'infrastructure', 'residential', 'cultural', 'healthcare'].map((v) => n('type', v)), [4, 2, 4, 6, 2, 1]);
  assert.deepEqual(site.scales.map((b) => n('scale', b.id)), [8, 3, 2]);
  assert.deepEqual(projects.filter((x, i) => !F[i].scale.length).map((x) => x.slug).sort(), ['avenir', 'sentry'], 'they state no surface');
  assert.deepEqual(['professional', 'academic'].map((v) => n('practice', v)), [12, 3]);
  for (const r of facetRows(site, projects)) for (const o of r.opts) {
    const c = n(r.id, o.id);
    assert.ok(c > 0 && c <= projects.length, `${r.id}=${o.id}: ${c}`);
  }
  assert.deepEqual(facetRows(site, projects).find((r) => r.id === 'year').opts.map((o) => o.id), ['2022', '2023', '2024', '2025', '2026']);
});
