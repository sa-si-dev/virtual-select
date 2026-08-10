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
 * These assertions live here rather than in Cypress deliberately. Written as
 * `cy.request('assets/virtual-select.min.css')` they passed against a bundle that genuinely carried
 * a BOM - because Cypress's `baseUrl` ends in `#/`, so the relative path resolved to the document
 * root and the server answered with `index.html`: the assertions were inspecting the docs homepage,
 * which is ASCII and BOM-free, and reported green while never seeing the stylesheet at all. Reading
 * the built file from disk removes both the URL and the HTTP layer from the question.
 *
 * `npm run test:build`, NOT `npm run test:scripts`, and that separation is load-bearing. These read
 * `dist/`, which is committed deliberately stale (build output is not committed per
 * `.github/README.md`), while the `static` CI job that runs `test:scripts` never builds. Run there,
 * they passed against a bundle predating the very rule they exist to protect - a PR deleting
 * `charset: false` without rebuilding would have stayed green. They run in the `e2e` job instead,
 * immediately after `npm run build`.
 *
 * For the same reason a missing or stale `dist/` is a hard failure rather than a skip: a skip is
 * how the original mistake stayed invisible.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const CSS_PATH = path.join(ROOT, 'dist/virtual-select.min.css');
const SCSS_DIR = path.join(ROOT, 'src/sass');

const HINT = 'Run `npm run build` first — these assertions describe the built artefact, not the source.';

/**
 * Newest mtime under src/sass, so a `dist/` older than the stylesheet source is reported as stale
 * rather than quietly asserted against. Without this the suite is green whenever someone edits SCSS
 * and forgets to rebuild, which is exactly the blind spot being closed.
 */
async function newestScssMtime(dir = SCSS_DIR) {
  const { readdir } = await import('node:fs/promises');
  const entries = await readdir(dir, { withFileTypes: true });
  let newest = 0;

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const mtime = entry.isDirectory() ? await newestScssMtime(full) : (await stat(full)).mtimeMs;
    if (mtime > newest) newest = mtime;
  }

  return newest;
}

async function readCssBytes() {
  let bytes;

  try {
    bytes = await readFile(CSS_PATH);
  } catch (error) {
    if (error.code === 'ENOENT') assert.fail(`dist/virtual-select.min.css is missing. ${HINT}`);
    throw error;
  }

  const [built, source] = [(await stat(CSS_PATH)).mtimeMs, await newestScssMtime()];
  assert.ok(built >= source, `dist/virtual-select.min.css is older than src/sass. ${HINT}`);

  return bytes;
}

test('the shipped stylesheet carries no byte-order mark', async () => {
  const bytes = await readCssBytes();
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

test('the shipped stylesheet is ASCII, so it needs no encoding declaration', async () => {
  const bytes = await readCssBytes();
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

/**
 * Derived from the file rather than hard-coded: the defect class is "a rule went missing", and
 * naming one rule only guards the rule that happened to be first when it was written. Both sides of
 * every animation are checked, so a dangling `animation-name` fails whichever animation it is.
 */
test('every animation the stylesheet references resolves to a keyframes rule', async () => {
  const css = (await readCssBytes()).toString('utf8');

  const declared = new Set([...css.matchAll(/@(?:-\w+-)?keyframes\s+([\w-]+)/g)].map((m) => m[1]));
  /** the `animation` shorthand puts the name anywhere among its values, so take every ident and
   *  keep the ones that name a real animation - matched loosely because the minifier rewrites
   *  `0.8s` to `.8s`, and pinning the shorthand would assert its formatting instead */
  const referenced = new Set(
    [...css.matchAll(/animation(?:-name)?:([^;}]+)/g)]
      .flatMap((m) => m[1].split(/[\s,]+/))
      .filter((token) => declared.has(token)),
  );

  assert.ok(declared.size > 0, 'no @keyframes rules survived in the build output at all');
  assert.ok(referenced.size > 0, 'no rule references any animation - the parser may have eaten one');

  // Every declared animation should be used, and every used one declared.
  assert.deepEqual(
    [...declared].filter((name) => !referenced.has(name)),
    [],
    'these @keyframes are declared but referenced by nothing - either dead CSS or the rule that ' +
      'used them was dropped',
  );
});

/**
 * The generic guard for the failure mode: a mid-file BOM destroys **whichever** rule follows the
 * banner, so this names no rule. Only ASCII whitespace may sit between the banner and the first
 * rule; anything else merges into the selector and the parser discards the rule.
 *
 * Deliberately does NOT use `trim()`/`trimStart()` to isolate the gap. JS treats U+FEFF as
 * whitespace, so trimming silently removes the very character being looked for - an earlier version
 * of this test did exactly that and passed against a build carrying a BOM at offset 167.
 */
test('nothing but ASCII whitespace separates the banner from the first rule', async () => {
  const css = (await readCssBytes()).toString('utf8');

  const bannerEnd = css.indexOf('*/');
  assert.notEqual(bannerEnd, -1, 'the licence banner is missing from the build output');

  const gap = css.slice(bannerEnd + 2, css.indexOf('{'));
  const preludeStart = gap.search(/\S/) === -1 ? gap.length : gap.search(/[^\s]/);
  const separator = gap.slice(0, preludeStart);

  const offending = [...separator]
    .map((char, i) => ({ char, i }))
    .filter(({ char }) => !' \t\r\n'.includes(char))
    .map(({ char, i }) => `U+${char.codePointAt(0).toString(16).toUpperCase()} at +${i}`);

  assert.deepEqual(
    offending,
    [],
    `invisible code point(s) between the banner and the first rule: ${offending.join(', ')}. ` +
      'These merge into the following selector and the parser drops that rule entirely.',
  );
});
