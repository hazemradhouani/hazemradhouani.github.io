#!/usr/bin/env node
// Writes docs/flagship/content-ledger.md: the conflicts and gaps (content/ledger-notes.md) followed by
// every published fact with its source, generated from content/*.json so it cannot drift from the site.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const cell = (s) => String(s ?? '').replace(/\|/g, '/').replace(/\n/g, ' ');
const short = (s, n = 110) => { s = cell(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
const out = [fs.readFileSync(path.join(ROOT, 'content/ledger-notes.md'), 'utf8').trim(), '', '## Published facts by page (generated)', ''];
const projects = fs.readdirSync(path.join(ROOT, 'content/projects')).map((f) => rd('content/projects/' + f)).sort((a, b) => a.order - b.order);
for (const p of projects) {
  out.push(`### ${p.title} (projects/project-${p.slug}.html)`, '', '| Field | Value | Source |', '|---|---|---|');
  if (p.quote) out.push(`| Quote | ${short(p.quote.text)} | ${cell(p.quote.source)} |`);
  p.role.forEach((r, i) => out.push(`| Role ${i + 1} | ${short(r.text)} | ${cell(r.source)} |`));
  p.spec.forEach((s) => out.push(`| ${cell(s.label)} | ${short(s.value)} | ${cell(s.source)} |`));
  p.narrative.forEach((t, i) => out.push(`| Text ${i + 1} | ${short(t.text)} | ${cell(t.source)} |`));
  if (p.honour) out.push(`| Honour | ${short(p.honour)} | site + answer:F01 |`);
  if (p.hero) out.push(`| Hero image | ${cell(p.hero.src)}${p.hero.credit ? ' (' + p.hero.credit + ')' : ''} | ${cell(p.hero.source || 'site')} |`);
  p.figures.forEach((f, i) => out.push(`| Fig. ${i + 1} | ${cell(f.title)}: ${short(f.caption, 80)} | ${cell(f.source || 'site')} |`));
  out.push('');
}
fs.writeFileSync(path.join(ROOT, 'docs/flagship/content-ledger.md'), out.join('\n') + '\n');
console.log(`ledger: ${projects.length} projects`);
