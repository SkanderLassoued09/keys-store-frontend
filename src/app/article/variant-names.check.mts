// Run: node src/app/article/variant-names.check.mts   (Node ≥ 22.18, no build step)
import assert from 'node:assert/strict';
import { expandVariantNames as x, guessFamily } from './variant-names.ts';

const vac = x('VAC1-33');
assert.equal(vac.length, 33);
assert.equal(vac[0], 'VAC1');
assert.equal(vac[32], 'VAC33');
assert.deepEqual(x('VAC1-VAC3'), ['VAC1', 'VAC2', 'VAC3']);
assert.deepEqual(x('UL 50..52'), ['UL 50', 'UL 51', 'UL 52']);
assert.deepEqual(x('K01-03'), ['K01', 'K02', 'K03']);
assert.deepEqual(x('206, 207\n208'), ['206', '207', '208']);
assert.deepEqual(x('UL50, ul50, UL51'), ['UL50', 'UL51'], 'dedupe case-insensitive');
assert.deepEqual(x('Clé Yale'), ['Clé Yale'], 'plain name untouched');
assert.deepEqual(x('VAC5-2'), ['VAC5-2'], 'reversed range kept literal');
assert.deepEqual(x('A1-B3'), ['A1-B3'], 'different prefixes kept literal');
assert.deepEqual(x('  ,  ; '), []);
assert.equal(x('X1-999').length, 1, 'oversized range kept literal, not 999 articles');
assert.equal(guessFamily(['VAC12']), 'VAC');
assert.equal(guessFamily(['UL 50']), 'UL');
assert.equal(guessFamily(['Clé-Yale-3']), 'Clé-Yale');
assert.equal(guessFamily(['206']), '');
console.log('variant-names: all checks passed');
