import test from 'node:test';
import assert from 'node:assert/strict';
import { cell, codeBlock, escapeHtml, slugify, stripControl, stripMarkers, truncate } from '../sanitize.mjs';

// Built rather than written literally so this file contains no raw control
// characters and no raw fence delimiter.
const NUL = String.fromCharCode(0);
const DEL = String.fromCharCode(127);
const FENCE = '`'.repeat(3);

test('stripControl removes control characters but keeps tab, newline and carriage return', () => {
  assert.equal(stripControl(`a${NUL}b${DEL}c`), 'abc');
  assert.equal(stripControl('a\tb\nc\rd'), 'a\tb\nc\rd');
});

test('stripMarkers removes HTML comment delimiters so the sticky marker cannot be forged', () => {
  assert.equal(stripMarkers('x<!-- virtual-select-pr-tests -->y'), 'x virtual-select-pr-tests y');
});

test('escapeHtml neutralises angle brackets', () => {
  assert.equal(escapeHtml('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
});

test('truncate appends a notice only when over the limit', () => {
  assert.equal(truncate('abc', 5), 'abc');
  assert.equal(truncate('abcdef', 3), 'abc… (truncated)');
});

test('cell escapes pipes so a spec name cannot break out of a table row', () => {
  assert.equal(cell('a|b'), 'a\\|b');
});

test('cell collapses newlines to spaces', () => {
  assert.equal(cell('line one\nline two'), 'line one line two');
});

test('cell escapes HTML because GitHub renders markup in comments', () => {
  assert.equal(cell('<b>x</b>'), '&lt;b&gt;x&lt;/b&gt;');
});

test('cell truncates to 120 characters by default', () => {
  assert.equal(cell('x'.repeat(200)).length, 120 + '… (truncated)'.length);
});

test('codeBlock neutralises fences so untrusted text cannot escape the block', () => {
  assert.equal(codeBlock(`before ${FENCE} after`), "before ''' after");
});

test('codeBlock does not escape HTML because fenced content is not rendered as markup', () => {
  assert.equal(codeBlock('<b>x</b>'), '<b>x</b>');
});

test('codeBlock truncates to 2000 characters by default', () => {
  assert.equal(codeBlock('y'.repeat(5000)).length, 2000 + '… (truncated)'.length);
});

test('slugify produces a filesystem-safe stem', () => {
  assert.equal(slugify('CI Scripts'), 'ci-scripts');
  assert.equal(slugify('Typecheck'), 'typecheck');
  assert.equal(slugify('  --E2E--  '), 'e2e');
});

test('every helper tolerates null and undefined', () => {
  for (const fn of [stripControl, stripMarkers, escapeHtml, cell, codeBlock]) {
    assert.equal(fn(null), '');
    assert.equal(fn(undefined), '');
  }
});
