/**
 * Pins what `dist/` ships and how large each file is gzipped.
 *
 * Like stylesheet-bytes.test.mjs this describes the built artefact, so it belongs to
 * `npm run test:build` (run after `npm run build`), and a missing `dist/` is a hard failure.
 * Budgets live in ../size-budgets.json; lower `maxGzip` when a change shrinks a file, and add an
 * entry when a new file starts shipping.
 *
 * The budgets have no headroom on purpose: every byte a file gains is a decision. A change that
 * makes a file grow (a dependency or toolchain bump included) fails here until the same PR raises
 * that file's `maxGzip` to the size this test reports, and `baselineGzip` too when it goes past
 * it, saying why in the commit message. `maxGzip` may exceed `baselineGzip` only with an
 * `aboveBaseline` reason in the entry.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { gzipSize } from '../lib/gzip-size.mjs';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const DIST = path.join(ROOT, 'dist');
const BUDGETS_PATH = new URL('../size-budgets.json', import.meta.url);

const HINT = 'Run `npm run build` first — these assertions describe the built artefact, not the source.';

async function listDist() {
  try {
    return (await readdir(DIST)).sort();
  } catch (error) {
    if (error.code === 'ENOENT') assert.fail(`dist/ is missing. ${HINT}`);
    throw error;
  }
}

/** Gzip size of a budgeted file, failing with the build hint when it was not built. */
async function gzipSizeOf(name) {
  try {
    return await gzipSize(path.join(DIST, name));
  } catch (error) {
    if (error.code === 'ENOENT') assert.fail(`dist/${name} has a budget but is missing. ${HINT}`);
    throw error;
  }
}

test('dist contains exactly the shipped files', async () => {
  assert.deepEqual(await listDist(), [
    'virtual-select-tooltip.js',
    'virtual-select-tooltip.min.css',
    'virtual-select-tooltip.min.js',
    'virtual-select.js',
    'virtual-select.min.css',
    'virtual-select.min.js',
  ]);
});

test('every shipped file is within its gzip budget', async () => {
  const budgets = JSON.parse(await readFile(BUDGETS_PATH, 'utf8'));

  for (const [name, { baselineGzip, maxGzip, aboveBaseline }] of Object.entries(budgets)) {
    // A budget above what the file replaced must say why, in words, in `aboveBaseline`.
    assert.ok(
      maxGzip <= baselineGzip || (typeof aboveBaseline === 'string' && aboveBaseline.trim() !== ''),
      `${name}: maxGzip ${maxGzip} exceeds baselineGzip ${baselineGzip} without an aboveBaseline reason`,
    );
    const size = await gzipSizeOf(name);
    assert.ok(size <= maxGzip, `${name}: ${size} bytes gzip, budget ${maxGzip}`);
  }
});

test('the bundle no longer carries the popover plugin', async () => {
  const js = await readFile(path.join(DIST, 'virtual-select.min.js'), 'utf8');
  for (const name of ['PopoverComponent', 'PopperComponent', 'popComp']) {
    assert.ok(!js.includes(name), `${name} is still in the bundle`);
  }
});

test('the stylesheet keeps the two popover rules and drops the arrow', async () => {
  const css = await readFile(path.join(DIST, 'virtual-select.min.css'), 'utf8');
  assert.match(css, /\.pop-comp-wrapper\{/);
  assert.match(css, /\.pop-comp-disable-events\{pointer-events:none\}/);
  assert.ok(!css.includes('pop-comp-arrow'));
  assert.ok(!css.includes('pop-comp-content'));
});
