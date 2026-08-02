import test from 'node:test';
import assert from 'node:assert/strict';
import { CANONICAL_CHECKS, mergeResults } from '../results.mjs';

const pass = (label) => ({ kind: 'step', label, outcome: 'passed', durationMs: 1000, outputTail: '' });
const fail = (label) => ({ kind: 'step', label, outcome: 'failed', durationMs: 2000, outputTail: 'boom' });
const allPassing = () => CANONICAL_CHECKS.map(pass);

test('the canonical list is ordered and complete', () => {
  assert.deepEqual(CANONICAL_CHECKS, ['Typecheck', 'ESLint', 'Stylelint', 'CI Scripts', 'Build', 'E2E']);
});

test('output follows canonical order regardless of input order', () => {
  const { checks } = mergeResults([pass('E2E'), pass('Typecheck')]);
  assert.deepEqual(checks.map((c) => c.label), CANONICAL_CHECKS);
});

test('a complete passing set concludes passed', () => {
  assert.equal(mergeResults(allPassing()).conclusion, 'passed');
});

test('any failure concludes failed', () => {
  const fragments = allPassing().filter((c) => c.label !== 'Build').concat(fail('Build'));
  assert.equal(mergeResults(fragments).conclusion, 'failed');
});

test('a missing fragment is synthesized as skipped', () => {
  const { checks } = mergeResults(allPassing().filter((c) => c.label !== 'E2E'));
  const e2e = checks.find((c) => c.label === 'E2E');
  assert.equal(e2e.outcome, 'skipped');
  assert.equal(e2e.durationMs, 0);
});

test('a skipped check concludes failed, so a timed-out job never looks green', () => {
  assert.equal(mergeResults(allPassing().filter((c) => c.label !== 'E2E')).conclusion, 'failed');
});

test('no fragments at all concludes failed with every check skipped', () => {
  const { conclusion, checks } = mergeResults([]);
  assert.equal(conclusion, 'failed');
  assert.equal(checks.length, CANONICAL_CHECKS.length);
  assert.ok(checks.every((c) => c.outcome === 'skipped'));
});

test('unknown labels are discarded rather than added as rows', () => {
  const { checks } = mergeResults([...allPassing(), pass('Injected')]);
  assert.equal(checks.length, CANONICAL_CHECKS.length);
  assert.ok(!checks.some((c) => c.label === 'Injected'));
});

test('malformed fragments are ignored', () => {
  const { checks } = mergeResults([null, undefined, 42, 'nope', {}, { label: 7 }, ...allPassing()]);
  assert.deepEqual(checks.map((c) => c.outcome), CANONICAL_CHECKS.map(() => 'passed'));
});

test('an e2e fragment keeps its per-spec detail', () => {
  const e2e = {
    kind: 'e2e',
    label: 'E2E',
    outcome: 'failed',
    durationMs: 5000,
    specs: [{ name: 'a.cy.ts', outcome: 'failed', tests: 2, passes: 1, failures: 1, durationMs: 100, failureMessages: ['x'] }],
  };
  const { checks } = mergeResults([e2e]);
  assert.deepEqual(checks.find((c) => c.label === 'E2E').specs, e2e.specs);
});

test('the last fragment wins when a label is duplicated', () => {
  const { checks } = mergeResults([pass('Build'), fail('Build')]);
  assert.equal(checks.find((c) => c.label === 'Build').outcome, 'failed');
});
