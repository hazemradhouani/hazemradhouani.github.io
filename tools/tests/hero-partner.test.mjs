import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { setRoot } from '../lib/images.mjs';
import { heroPartner } from '../templates/partials.mjs';

// Chapters (D74) group figures without moving them: the authored order decides each portrait hero's
// partner, the Work page previews and the fig-n anchors, so both are pinned here.
const REPO = fileURLToPath(new URL('../..', import.meta.url));
setRoot(REPO);
const PINNED = {
  'ain-sebaa': [null, '30dd9e7b037e'], 'al-arg': [null, 'c5b41ec4a363'], avenir: [null, 'fd77abaca3a4'],
  belhomme: ['images/belhomme/belhomme-courtyard-render-hq.jpg', '1fe27c0c87cb'], bolivar: ['images/bolivar/bolivar-street-render-hq.jpg', '5b2f316800da'],
  cinephile: [null, 'e2ac5e6bbabc'], corallum: [null, '1aba5db1bf6b'], foubert: [null, '9578d2413bff'], 'hay-mohammadi': [null, 'bc37e3b9d137'],
  'la-villette': ['images/la-villette/la-villette-garden-render.jpg', '5d0e59ac9514'], 'nouvelle-medina': [null, '23db9a36129d'],
  papillon: [null, 'fec700983487'], sentry: [null, 'de8e23593b46'], tamansourt: [null, '53d667d11cd3'], zenata: [null, '1ae9f3ae3f4b'],
};

test('figure order and hero partners are unchanged by the chapter grouping (D74)', () => {
  const dir = path.join(REPO, 'content/projects');
  const now = Object.fromEntries(fs.readdirSync(dir).map((f) => {
    const x = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const order = crypto.createHash('sha256').update(JSON.stringify(x.figures.map((g) => g.src || g.items.map((i) => i.src)))).digest('hex').slice(0, 12);
    return [x.slug, [heroPartner(x)?.src || null, order]];
  }));
  assert.deepEqual(now, PINNED);
});
