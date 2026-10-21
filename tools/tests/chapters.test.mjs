import assert from 'node:assert/strict';
import test from 'node:test';
import { chaptersOf } from '../templates/partials.mjs';

// chapters (D74): synthetic projects, so the rules are tested apart from the content
const fig = (title) => ({ title, src: `images/x/${title}.jpg` });
const figs = ['Site plan', 'Panorama', 'Ground floor', 'Section A-A', 'Across the tracks'].map(fig);
const project = (chapters, narrative = []) => ({ slug: 'x', chapters, narrative });

test('a chapter runs from its first figure to the next chapter, and paragraphs join the chapter they name', () => {
  const x = project([{ title: 'Site', from: 'Site plan' }, { title: 'Plans and sections', from: 'Ground floor' }, { title: 'Views', from: 'Across the tracks' }],
    [{ text: 'general' }, { text: 'the footbridge', chapter: 'Site' }]);
  const chs = chaptersOf(x, figs);
  assert.deepEqual(chs.map((c) => [c.n, c.id, c.figs.map((f) => f.title)]), [
    [1, 'site', ['Site plan', 'Panorama']], [2, 'plans-and-sections', ['Ground floor', 'Section A-A']], [3, 'views', ['Across the tracks']]]);
  assert.deepEqual(chs[0].text.map((t) => t.text), ['the footbridge']);
  assert.equal(chs[1].text.length, 0);
});

test('chapter ids drop accents and punctuation', () => {
  assert.equal(chaptersOf(project([{ title: 'Façades & sections', from: 'Site plan' }]), figs)[0].id, 'facades-sections');
});

test('bad chapter maps fail the build with the reason', () => {
  assert.throws(() => chaptersOf(project([]), figs), /no chapters/u);
  assert.throws(() => chaptersOf(project([{ title: 'Site', from: 'Site plan' }, { title: 'Plans', from: 'Roof plan' }]), figs), /names 0 figures/u);
  assert.throws(() => chaptersOf(project([{ title: 'Site', from: 'Site plan' }]), [...figs, fig('Site plan')]), /names 2 figures/u);
  assert.throws(() => chaptersOf(project([{ title: 'Plans', from: 'Ground floor' }]), figs), /first chapter must start at the first figure/u);
  assert.throws(() => chaptersOf(project([{ title: 'Site', from: 'Site plan' }, { title: 'Views', from: 'Across the tracks' }, { title: 'Plans', from: 'Ground floor' }]), figs), /starts before/u);
  assert.throws(() => chaptersOf(project([{ title: 'Site', from: 'Site plan' }, { title: 'Site', from: 'Ground floor' }]), figs), /share a title/u);
  assert.throws(() => chaptersOf(project([{ title: 'Site', from: 'Site plan' }], [{ text: 'p', chapter: 'Structure' }]), figs), /does not exist/u);
});

test('a hero partner is not a figure of any chapter, so a chapter cannot start at it', () => {
  const partner = fig('Rear courtyard');
  const all = [partner, ...figs];
  const shown = all.filter((f) => f !== partner);   // as project() does
  assert.throws(() => chaptersOf(project([{ title: 'Views', from: 'Rear courtyard' }]), shown), /names 0 figures/u);
  assert.equal(chaptersOf(project([{ title: 'Site', from: 'Site plan' }]), shown)[0].figs.length, 5);
});
