import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_ARTIFACT_BYTES, parseArtifactJson, validatePr, validateResults } from '../validate.mjs';

const SHA = 'a'.repeat(40);

test('valid JSON parses', () => {
  assert.deepEqual(parseArtifactJson('pr.json', '{"a":1}'), { a: 1 });
});

test('malformed JSON throws', () => {
  assert.throws(() => parseArtifactJson('pr.json', '{nope'), /malformed JSON/);
});

test('oversized input throws before parsing', () => {
  const huge = `"${'x'.repeat(MAX_ARTIFACT_BYTES + 1)}"`;
  assert.throws(() => parseArtifactJson('results.json', huge), /exceeds/);
});

test('a valid pr payload is accepted and narrowed to known fields', () => {
  assert.deepEqual(validatePr({ number: 42, headSha: SHA, extra: 'ignored' }), { number: 42, headSha: SHA });
});

test('a non-integer or non-positive pr number is rejected', () => {
  for (const number of [0, -1, 1.5, '42', null, undefined, NaN]) {
    assert.throws(() => validatePr({ number, headSha: SHA }), /positive integer/);
  }
});

test('a malformed head sha is rejected', () => {
  for (const headSha of ['', 'zzz', 'A'.repeat(40), 'a'.repeat(39), 42, null]) {
    assert.throws(() => validatePr({ number: 1, headSha }), /headSha/);
  }
});

test('non-objects and arrays are rejected as pr payloads', () => {
  for (const value of [null, undefined, 'x', 7, []]) {
    assert.throws(() => validatePr(value), /object/);
  }
});

test('a valid results payload is accepted', () => {
  const value = {
    conclusion: 'failed',
    checks: [{
      kind: 'step',
      label: 'Build',
      outcome: 'failed',
      durationMs: 1234,
      outputTail: 'boom',
    }],
  };
  assert.deepEqual(validateResults(value), value);
});

test('an unknown conclusion is rejected', () => {
  assert.throws(() => validateResults({ conclusion: 'maybe', checks: [] }), /conclusion/);
});

test('a non-array checks field is rejected', () => {
  assert.throws(() => validateResults({ conclusion: 'passed', checks: {} }), /array/);
});

test('an absurd number of checks is rejected', () => {
  const checks = Array.from({
    length: 65,
  }, () => ({
    kind: 'step',
    label: 'x',
    outcome: 'passed',
    durationMs: 1,
    outputTail: '',
  }));
  assert.throws(() => validateResults({ conclusion: 'passed', checks }), /too many/);
});

test('a malformed step check is rejected', () => {
  for (const check of [
    { kind: 'step', label: 1, outcome: 'passed', durationMs: 1, outputTail: '' },
    { kind: 'step', label: 'x', outcome: 'maybe', durationMs: 1, outputTail: '' },
    { kind: 'step', label: 'x', outcome: 'passed', durationMs: -1, outputTail: '' },
    { kind: 'step', label: 'x', outcome: 'passed', durationMs: 1, outputTail: 42 },
    { kind: 'unknown', label: 'x', outcome: 'passed', durationMs: 1, outputTail: '' },
    null,
  ]) {
    assert.throws(() => validateResults({ conclusion: 'passed', checks: [check] }), /checks\[0\]|kind|outcome|string/);
  }
});

test('a valid e2e check with specs is accepted', () => {
  const value = {
    conclusion: 'failed',
    checks: [{
      kind: 'e2e',
      label: 'E2E',
      outcome: 'failed',
      durationMs: 5000,
      outputTail: '',
      specs: [{
        name: 'examples.cy.ts',
        outcome: 'failed',
        tests: 4,
        passes: 3,
        failures: 1,
        durationMs: 2000,
        failureMessages: ['AssertionError: expected 1 to equal 0'],
      }],
    }],
  };

  assert.deepEqual(validateResults(value), value);
});

test('a malformed e2e check is rejected', () => {
  const invalidChecks = [
    { kind: 'e2e', label: 'E2E', outcome: 'failed', durationMs: 1, outputTail: '', specs: 'nope' },
    { kind: 'e2e', label: 'E2E', outcome: 'failed', durationMs: 1, outputTail: '', specs: [null] },
    {
      kind: 'e2e',
      label: 'E2E',
      outcome: 'failed',
      durationMs: 1,
      outputTail: '',
      specs: [{
        name: 'x.cy.ts',
        outcome: 'failed',
        tests: 1,
        passes: 0,
        failures: 1,
        durationMs: 1,
        failureMessages: 42,
      }],
    },
    {
      kind: 'e2e',
      label: 'E2E',
      outcome: 'failed',
      durationMs: 1,
      outputTail: '',
      specs: [{
        name: 'x.cy.ts',
        outcome: 'failed',
        tests: 1,
        passes: 0,
        failures: 1,
        durationMs: 1,
        failureMessages: [42],
      }],
    },
  ];

  invalidChecks.forEach((check) => {
    assert.throws(() => validateResults({ conclusion: 'failed', checks: [check] }), /specs|failureMessages|checks\[0\]/);
  });
});
