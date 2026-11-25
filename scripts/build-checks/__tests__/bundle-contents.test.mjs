/**
 * Pins what `dist/` ships and how large each file is gzipped.
 *
 * Like stylesheet-bytes.test.mjs this describes the built artefact, so it belongs to
 * `npm run test:build` (run after `npm run build`). A missing `dist/`, or one older than `src/`,
 * is a hard failure: `dist/` is committed and deliberately stale, so without the age check a local
 * run would measure the old committed bundle and pass.
 *
 * Budgets live in ../size-budgets.json and every shipped minified file needs one. They have no
 * headroom on purpose: every byte a file gains is a decision, so a file must measure exactly its
 * `maxGzip`. A change that shrinks a file fails here until the same PR lowers `maxGzip` to the
 * size this test reports. A change that makes a file grow (a dependency or toolchain bump
 * included) fails until the same PR raises `maxGzip`, and `baselineGzip` too when it goes past
 * it, saying why in the commit message. `maxGzip` may exceed `baselineGzip` only with an
 * `aboveBaseline` reason in the entry.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { gzipSize } from '../lib/gzip-size.mjs';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const DIST = path.join(ROOT, 'dist');
const SRC = path.join(ROOT, 'src');
const BUDGETS_PATH = new URL('../size-budgets.json', import.meta.url);

const HINT = 'Run `npm run build` first — these assertions describe the built artefact, not the source.';

/** Newest mtime of any file under `dir`. */
async function newestMtime(dir) {
  let newest = 0;

  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const mtime = entry.isDirectory() ? await newestMtime(full) : (await stat(full)).mtimeMs;
    if (mtime > newest) newest = mtime;
  }

  return newest;
}

async function readBudgets() {
  return JSON.parse(await readFile(BUDGETS_PATH, 'utf8'));
}

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

test('dist is newer than src', async () => {
  const source = await newestMtime(SRC);
  const stale = [];

  for (const name of await listDist()) {
    if ((await stat(path.join(DIST, name))).mtimeMs < source) stale.push(name);
  }

  assert.deepEqual(stale, [], `dist/ files older than src/: ${stale.join(', ')}. ${HINT}`);
});

test('every shipped minified file has a gzip budget', async () => {
  const budgets = await readBudgets();
  const unbudgeted = (await listDist()).filter((name) => /\.min\.(js|css)$/.test(name) && !(name in budgets));

  assert.deepEqual(unbudgeted, [], `add a size-budgets.json entry for: ${unbudgeted.join(', ')}`);
});

test('every budgeted file measures exactly its gzip budget', async () => {
  for (const [name, { baselineGzip, maxGzip, aboveBaseline }] of Object.entries(await readBudgets())) {
    // A budget above what the file replaced must say why, in words, in `aboveBaseline`.
    assert.ok(
      maxGzip <= baselineGzip || (typeof aboveBaseline === 'string' && aboveBaseline.trim() !== ''),
      `${name}: maxGzip ${maxGzip} exceeds baselineGzip ${baselineGzip} without an aboveBaseline reason`,
    );
    const size = await gzipSizeOf(name);
    assert.ok(size <= maxGzip, `${name}: ${size} bytes gzip, budget ${maxGzip}`);
    assert.ok(size === maxGzip, `${name}: ${size} bytes gzip, under its budget ${maxGzip}; lower maxGzip to ${size}`);
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
