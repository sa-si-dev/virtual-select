import test from 'node:test';
import assert from 'node:assert/strict';
import { MARKER, MAX_COMMENT_CHARS, renderComment } from '../render.mjs';

const base = {
  headSha: 'abc1234def5678901234567890123456789abcde',
  runUrl: 'https://github.com/o/r/actions/runs/1',
  runNumber: 123,
  hasScreenshots: false,
};

const step = (label, outcome, durationMs = 12000, outputTail = '') => ({ kind: 'step', label, outcome, durationMs, outputTail });

function render(checks, conclusion, overrides = {}) {
  return renderComment({ results: { conclusion, checks }, ...base, ...overrides });
}

test('the marker is the first line so the sticky lookup can find it', () => {
  assert.ok(render([step('Build', 'passed')], 'passed').startsWith(MARKER));
});

test('a passing report is headed with a tick and no failure count', () => {
  const body = render([step('Build', 'passed')], 'passed');
  assert.match(body, /### PR Test Results — ✅/);
  assert.ok(!body.includes('failing'));
});

test('a failing report counts the failures', () => {
  const body = render([step('Build', 'failed'), step('ESLint', 'passed')], 'failed');
  assert.match(body, /### PR Test Results — ❌ 1 failing/);
});

test('each check becomes a table row with an icon and duration', () => {
  const body = render([step('Typecheck', 'passed', 12000)], 'passed');
  assert.match(body, /\| Typecheck \| ✅ \| 12s \|/);
});

test('durations over a minute are rendered as minutes and seconds', () => {
  const body = render([step('Build', 'passed', 62004)], 'passed');
  assert.match(body, /1m02s/);
});

test('a skipped check is shown explicitly rather than omitted', () => {
  const body = render([step('Build', 'failed'), step('E2E', 'skipped', 0)], 'failed');
  assert.match(body, /\| E2E \| ⏭️ skipped \| — \|/);
});

test('an e2e check expands into one row per spec', () => {
  const e2e = {
    kind: 'e2e',
    label: 'E2E',
    outcome: 'failed',
    durationMs: 90000,
    specs: [
      { name: 'examples.cy.ts', outcome: 'passed', tests: 12, passes: 12, failures: 0, durationMs: 62004, failureMessages: [] },
      { name: 'timer-cleanup.cy.ts', outcome: 'failed', tests: 4, passes: 3, failures: 1, durationMs: 22000, failureMessages: ['boom'] },
    ],
  };
  const body = render([e2e], 'failed');

  assert.match(body, /\| examples\.cy\.ts \| ✅ 12\/12 \| 1m02s \|/);
  assert.match(body, /\| timer-cleanup\.cy\.ts \| ❌ 3\/4 \| 22s \|/);
});

test('failure output appears in a collapsed block', () => {
  const body = render([step('ESLint', 'failed', 1000, 'no-unused-vars')], 'failed');
  assert.match(body, /<details><summary>Failures<\/summary>/);
  assert.match(body, /no-unused-vars/);
});

test('a passing report has no failures block', () => {
  assert.ok(!render([step('Build', 'passed')], 'passed').includes('<details>'));
});

test('the tested commit is stamped so a stale comment is visible', () => {
  assert.match(render([step('Build', 'passed')], 'passed'), /Tested commit: `abc1234`/);
});

test('screenshots are mentioned only when they exist', () => {
  assert.ok(!render([step('Build', 'passed')], 'passed').includes('cypress-screenshots'));
  assert.match(render([step('Build', 'failed')], 'failed', { hasScreenshots: true }), /cypress-screenshots/);
});

test('a hostile spec name cannot break out of the table', () => {
  const e2e = {
    kind: 'e2e',
    label: 'E2E',
    outcome: 'failed',
    durationMs: 1,
    specs: [{ name: 'a|b <img src=x> <!-- x -->', outcome: 'failed', tests: 1, passes: 0, failures: 1, durationMs: 1, failureMessages: [] }],
  };
  const body = render([e2e], 'failed');

  assert.ok(body.includes('a\\|b'));
  assert.ok(!body.includes('<img'));
  assert.equal(body.split(MARKER).length, 2, 'the marker must not be forgeable');
});

test('hostile failure output cannot escape the code fence', () => {
  const fence = '`'.repeat(3);
  const body = render([step('Build', 'failed', 1, `x ${fence} y`)], 'failed');
  assert.ok(!body.includes(`x ${fence} y`));
  assert.match(body, /x ''' y/);
});

test('dangerous markup in failure output stays inside a fenced block', () => {
  // codeBlock deliberately does not escape HTML: inside a fence GitHub renders
  // content as inert literal text, and escaping would corrupt legitimate output
  // such as TypeScript generics into visible &lt; entities. The safety property
  // is therefore *containment*, and this test pins it down.
  const fence = '`'.repeat(3);
  const body = render([step('Build', 'failed', 1, '<script>alert(1)</script>')], 'failed');
  const lines = body.split('\n');
  const index = lines.findIndex((line) => line.includes('<script>'));

  assert.notEqual(index, -1, 'the payload should be present, just contained');

  const fencesBefore = lines.slice(0, index).filter((line) => line.trim() === fence).length;
  assert.equal(fencesBefore % 2, 1, '<script> must sit between an opening and closing fence');
});

test('malformed spec fields cannot crash the renderer (defense in depth)', () => {
  // validateResults now enforces nested schema shape, but renderComment is a
  // pure function and should still be resilient if reused with malformed input.
  const hostile = {
    kind: 'e2e',
    label: 'E2E',
    outcome: 'failed',
    durationMs: 1,
    specs: [
      { name: 'a.cy.ts', outcome: 'failed', tests: 1, passes: 0, failures: 1, durationMs: 1, failureMessages: 42 },
      null,
    ],
  };

  assert.doesNotThrow(() => render([hostile], 'failed'));
  assert.doesNotThrow(() => render([{ ...hostile, specs: 'not-an-array' }], 'failed'));
});

test('the comment is capped below the GitHub limit', () => {
  // codeBlock already caps each block at 2000 chars, so the overflow has to come
  // from the number of failing checks rather than the size of any one of them.
  const checks = Array.from({ length: 40 }, (_, index) => step(`Check ${index}`, 'failed', 1, 'z'.repeat(50_000)));
  const body = render(checks, 'failed');

  assert.ok(body.length <= MAX_COMMENT_CHARS, `expected <= ${MAX_COMMENT_CHARS}, got ${body.length}`);
  assert.match(body, /output truncated/i);
});

test('truncation never leaves an unclosed code fence', () => {
  // The size cap slices the body at a character offset, which can land inside
  // a fenced failure block. An unclosed fence swallows the truncation notice
  // and footer into the code block. Every fence in the final body must be
  // closed: the count of fence-only lines has to be even.
  const checks = Array.from({ length: 40 }, (_, index) => step(`Check ${index}`, 'failed', 1, 'z'.repeat(50_000)));
  const body = render(checks, 'failed');
  const fence = '`'.repeat(3);
  const fenceLines = body.split('\n').filter((line) => line.trim() === fence).length;

  assert.equal(fenceLines % 2, 0, 'a truncated body must not leave a fence open');
  assert.match(body, /output truncated/i);
  assert.ok(body.trimEnd().endsWith(`[Run #${base.runNumber}](${base.runUrl})`), 'the footer must survive outside any fence');
});

test('an e2e launch failure still reports its reason', () => {
  // Cypress-could-not-start fragments carry specs: [] and a populated outputTail.
  // An `Array.isArray` check alone matches the empty array and swallows the reason.
  const e2e = {
    kind: 'e2e', label: 'E2E', outcome: 'failed', durationMs: 5000, specs: [],
    outputTail: 'docsify did not accept connections within 60000ms',
  };
  const body = render([e2e], 'failed');

  assert.match(body, /docsify did not accept connections/);
});

test('skipped checks count toward the failing total', () => {
  // A job killed by timeout-minutes uploads no fragments, so every check merges
  // to `skipped`. Counting only `failed` renders the nonsensical "0 failing".
  const checks = ['Typecheck', 'Build', 'E2E'].map((label) => step(label, 'skipped', 0));

  assert.match(render(checks, 'failed'), /❌ 3 failing/);
});

test('spec counts cannot inject markdown', () => {
  const e2e = {
    kind: 'e2e', label: 'E2E', outcome: 'failed', durationMs: 1,
    specs: [{ name: 'a.cy.ts', outcome: 'failed', passes: '0 |\n\n### Injected\n\n| x', tests: 1, durationMs: 1, failureMessages: [] }],
  };
  const body = render([e2e], 'failed');

  assert.ok(!body.includes('### Injected'));
  assert.match(body, /❌ 0\/1/);
});

test('the workflow marker matches the exported MARKER', async () => {
  // The workflow hardcodes this literal; a desync would silently make every run
  // create a new comment instead of updating the sticky one.
  const { readFile } = await import('node:fs/promises');
  const yaml = await readFile(new URL('../../../../.github/workflows/pr-test-comment.yml', import.meta.url), 'utf8');

  assert.ok(yaml.includes(MARKER), `workflow does not contain MARKER: ${MARKER}`);
});

test('the hostile fixture renders safely', async () => {
  const { readFile } = await import('node:fs/promises');
  const raw = await readFile(new URL('../../__fixtures__/hostile-results.json', import.meta.url), 'utf8');
  const results = JSON.parse(raw);
  const body = renderComment({ results, headSha: 'a'.repeat(40), runUrl: 'http://x', runNumber: 1, hasScreenshots: false });

  assert.equal(body.split(MARKER).length - 1, 1, 'marker must appear exactly once');
  assert.ok(!body.includes('<img'), 'no live img tag');

  // The fixture's <script> lives inside a fenced code block, where it is inert
  // BY DESIGN (codeBlock deliberately does not escape HTML — escaping there
  // would corrupt legitimate output like `Array<string>`). So the safety
  // property to assert is containment between fences, not absence.
  const lines = body.split('\n');
  const fence = '`'.repeat(3);
  const index = lines.findIndex((line) => line.includes('<script'));
  assert.notEqual(index, -1, 'the payload should be present, just contained');
  const fencesBefore = lines.slice(0, index).filter((line) => line.trim() === fence).length;
  assert.equal(fencesBefore % 2, 1, '<script must sit between an opening and closing fence');
});
