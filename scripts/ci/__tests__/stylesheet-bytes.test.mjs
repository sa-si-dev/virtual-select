/**
 * Byte-level guards on the stylesheet we ship.
 *
 * Dart Sass prepends an encoding hint whenever its output contains a non-ASCII character - a
 * U+FEFF BOM in the compressed output we ship - and webpack's BannerPlugin then prepends the
 * licence banner in front of it. A BOM at position 0 is stripped by every CSS parser; mid-file it
 * is a valid CSS *ident* code point, so the parser reads it as the start of a selector, swallows
 * the rule that follows and drops both. That silently deleted `@keyframes vscomp-animation-spin`
 * while `.vscomp-options-loader::before` kept referencing it, leaving the options loader frozen.
 *
 * These assertions live here rather than in Cypress deliberately: the equivalent cases written as
 * `cy.request()` passed against a bundle that genuinely carried a BOM, because the HTTP layer
 * decodes the response and strips it on the way through - green while verifying nothing. Reading
 * the built file from disk is the only way to see the bytes being asserted about.
 *
 * Skipped when `dist/` has not been built, so `npm run test:scripts` still works on a clean
 * checkout; CI builds before testing, and the skip is reported rather than silent.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const CSS_PATH = fileURLToPath(new URL('../../../dist/virtual-select.min.css', import.meta.url));

async function readCssBytes() {
  try {
    return await readFile(CSS_PATH);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

test('the shipped stylesheet carries no byte-order mark', async (t) => {
  const bytes = await readCssBytes();

  if (!bytes) {
    t.skip('dist/virtual-select.min.css not built - run `npm run build` first');
    return;
  }

  const found = [];

  for (let i = 0; i < bytes.length - 2; i += 1) {
    if (bytes[i] === 0xef && bytes[i + 1] === 0xbb && bytes[i + 2] === 0xbf) found.push(i);
  }

  assert.deepEqual(
    found,
    [],
    `EF BB BF (U+FEFF) found at byte offset ${found.join(', ')}. A BOM anywhere but offset 0 ` +
      'destroys the rule that follows it; BannerPlugin guarantees offset 0 is not where Sass put ' +
      'it. Fix with `charset: false` in the sass-loader options, not by reordering rules.',
  );
});

test('the shipped stylesheet is ASCII, so it needs no encoding declaration', async (t) => {
  const bytes = await readCssBytes();

  if (!bytes) {
    t.skip('dist/virtual-select.min.css not built - run `npm run build` first');
    return;
  }

  const found = [];

  for (let i = 0; i < bytes.length; i += 1) {
    if (bytes[i] > 0x7f) found.push(`0x${bytes[i].toString(16)}@${i}`);
  }

  assert.deepEqual(
    found,
    [],
    `non-ASCII bytes: ${found.slice(0, 8).join(', ')}. With no encoding hint emitted, a non-ASCII ` +
      "byte decodes according to the consuming page's charset. Emit the character as a CSS escape " +
      "instead - e.g. string.unquote('\"\\\\26A0\"') - so the sheet stays ASCII.",
  );
});

test('the loader keyframes rule is present in the built stylesheet', async (t) => {
  const bytes = await readCssBytes();

  if (!bytes) {
    t.skip('dist/virtual-select.min.css not built - run `npm run build` first');
    return;
  }

  const css = bytes.toString('utf8');

  assert.ok(
    css.includes('@keyframes vscomp-animation-spin'),
    'the options loader animation is missing from the build output',
  );
  /** matched loosely on purpose: the minifier rewrites `0.8s` to `.8s`, and pinning the exact
   *  shorthand asserts the minifier's formatting rather than that the reference survives */
  assert.match(
    css,
    /animation:[^;}]*vscomp-animation-spin/,
    'the loader rule no longer references the animation',
  );
});
