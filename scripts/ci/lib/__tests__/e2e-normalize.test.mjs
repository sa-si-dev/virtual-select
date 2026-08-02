import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCypressResults } from '../e2e-normalize.mjs';

const passingRun = {
  spec: { name: 'examples.cy.ts', relative: 'cypress/e2e/examples.cy.ts' },
  stats: { tests: 12, passes: 12, failures: 0, duration: 62004 },
  tests: [],
};

const failingRun = {
  spec: { name: 'timer-cleanup.cy.ts', relative: 'cypress/e2e/timer-cleanup.cy.ts' },
  stats: { tests: 4, passes: 3, failures: 1, duration: 22000 },
  tests: [
    { title: ['timers', 'clears on destroy'], state: 'failed', displayError: 'AssertionError: expected 1 to equal 0' },
    { title: ['timers', 'other'], state: 'passed', displayError: null },
  ],
};

test('a clean run normalizes to passed with per-spec stats', () => {
  const result = normalizeCypressResults({ totalFailed: 0, runs: [passingRun] }, 70000);

  assert.equal(result.kind, 'e2e');
  assert.equal(result.label, 'E2E');
  assert.equal(result.outcome, 'passed');
  assert.equal(result.durationMs, 70000);
  assert.deepEqual(result.specs, [{
    name: 'examples.cy.ts',
    outcome: 'passed',
    tests: 12,
    passes: 12,
    failures: 0,
    durationMs: 62004,
    failureMessages: [],
  }]);
});

test('a failing spec is marked failed and its error captured', () => {
  const result = normalizeCypressResults({ totalFailed: 1, runs: [passingRun, failingRun] }, 90000);
  const failing = result.specs.find((spec) => spec.name === 'timer-cleanup.cy.ts');

  assert.equal(result.outcome, 'failed');
  assert.equal(failing.outcome, 'failed');
  assert.equal(failing.failureMessages.length, 1);
  assert.match(failing.failureMessages[0], /clears on destroy/);
  assert.match(failing.failureMessages[0], /expected 1 to equal 0/);
});

test('a launch failure with no runs array is reported rather than crashing', () => {
  const result = normalizeCypressResults({ status: 'failed', message: 'Cypress binary missing' }, 500);

  assert.equal(result.outcome, 'failed');
  assert.deepEqual(result.specs, []);
  assert.match(result.outputTail, /Cypress binary missing/);
});

test('a null result is reported rather than crashing', () => {
  const result = normalizeCypressResults(null, 0);

  assert.equal(result.outcome, 'failed');
  assert.deepEqual(result.specs, []);
  assert.ok(result.outputTail.length > 0);
});

test('missing stats default to zero instead of undefined', () => {
  const result = normalizeCypressResults({ totalFailed: 0, runs: [{ spec: {}, stats: {} }] }, 10);

  assert.deepEqual(result.specs[0], {
    name: 'unknown',
    outcome: 'passed',
    tests: 0,
    passes: 0,
    failures: 0,
    durationMs: 0,
    failureMessages: [],
  });
});
