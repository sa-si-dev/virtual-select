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
  const value = { conclusion: 'failed', checks: [{ label: 'Build', outcome: 'failed' }] };
  assert.deepEqual(validateResults(value), value);
});

test('an unknown conclusion is rejected', () => {
  assert.throws(() => validateResults({ conclusion: 'maybe', checks: [] }), /conclusion/);
});

test('a non-array checks field is rejected', () => {
  assert.throws(() => validateResults({ conclusion: 'passed', checks: {} }), /array/);
});

test('an absurd number of checks is rejected', () => {
  const checks = Array.from({ length: 65 }, () => ({ label: 'x', outcome: 'passed' }));
  assert.throws(() => validateResults({ conclusion: 'passed', checks }), /too many/);
});

test('a check entry with non-string label or outcome is rejected', () => {
  for (const check of [{ label: 1, outcome: 'passed' }, { label: 'x', outcome: 2 }, null]) {
    assert.throws(() => validateResults({ conclusion: 'passed', checks: [check] }), /check entry/);
  }
});
