import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

test('every page that lived under /portfolio/ redirects to its address at the host root (D81)', () => {
  const site = JSON.parse(read('content/site.json'));
  assert.equal(site.base, '/', 'Google gives site names and favicons per host, so the site lives at the root');
  const live = site.origin + site.base;
  const locs = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locs.length > 10);
  const pages = [...locs.map((u) => u.slice(live.length) || 'index.html'), 'videos.html'];
  for (const rel of pages) {
    const to = live + (rel === 'index.html' ? '' : rel);
    const stub = read(`portfolio/${rel}`);
    assert.ok(stub.includes(`<link rel="canonical" href="${to}">`), `${rel}: canonical`);
    assert.ok(stub.includes(`content="0; url=${to}"`), `${rel}: instant refresh`);
    assert.ok(stub.includes(`location.replace(${JSON.stringify(to)}`), `${rel}: script redirect`);
    assert.doesNotMatch(stub, /noindex/u, `${rel}: a redirect must not be noindex`);
  }
  assert.match(read('404.html'), /indexOf\('\/portfolio\/'\)===0/u, 'old files under /portfolio/ move to the root from the 404 page');
});
