import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const RUN_STEP = fileURLToPath(new URL('../run-step.mjs', import.meta.url));

async function runStep(label, args, resultsDir) {
  try {
    const { stdout } = await execFileAsync(process.execPath, [RUN_STEP, label, ...args], {
      env: { ...process.env, CI_RESULTS_DIR: resultsDir },
    });
    return { code: 0, stdout };
  } catch (error) {
    return { code: error.code, stdout: error.stdout ?? '' };
  }
}

async function readFragment(resultsDir, slug) {
  return JSON.parse(await readFile(path.join(resultsDir, `step-${slug}.json`), 'utf8'));
}

test('a passing command yields a passed fragment and exit code 0', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'run-step-'));
  t.after(() => rm(dir, { recursive: true, force: true }));

  const { code } = await runStep('Typecheck', [process.execPath, '-e', 'console.log("hi")'], dir);
  const fragment = await readFragment(dir, 'typecheck');

  assert.equal(code, 0);
  assert.equal(fragment.kind, 'step');
  assert.equal(fragment.label, 'Typecheck');
  assert.equal(fragment.outcome, 'passed');
  assert.ok(fragment.outputTail.includes('hi'));
  assert.equal(typeof fragment.durationMs, 'number');
});

test('a failing command yields a failed fragment and propagates the exit code', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'run-step-'));
  t.after(() => rm(dir, { recursive: true, force: true }));

  const { code } = await runStep('ESLint', [process.execPath, '-e', 'console.error("nope");process.exit(3)'], dir);
  const fragment = await readFragment(dir, 'eslint');

  assert.equal(code, 3);
  assert.equal(fragment.outcome, 'failed');
  assert.ok(fragment.outputTail.includes('nope'));
});

test('the label is slugified for the filename but preserved in the payload', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'run-step-'));
  t.after(() => rm(dir, { recursive: true, force: true }));

  await runStep('CI Scripts', [process.execPath, '-e', ''], dir);

  assert.equal((await readFragment(dir, 'ci-scripts')).label, 'CI Scripts');
});

test('the output tail is capped at 4000 characters', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'run-step-'));
  t.after(() => rm(dir, { recursive: true, force: true }));

  await runStep('Build', [process.execPath, '-e', 'process.stdout.write("x".repeat(20000))'], dir);

  assert.equal((await readFragment(dir, 'build')).outputTail.length, 4000);
});

test('a command that cannot be spawned still writes a failed fragment', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'run-step-'));
  t.after(() => rm(dir, { recursive: true, force: true }));

  const { code } = await runStep('Build', ['definitely-not-a-real-binary-xyz'], dir);
  const fragment = await readFragment(dir, 'build');

  assert.notEqual(code, 0);
  assert.equal(fragment.outcome, 'failed');
});

test('missing arguments exit 2 without writing a fragment', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'run-step-'));
  t.after(() => rm(dir, { recursive: true, force: true }));

  const { code } = await runStep('OnlyALabel', [], dir);

  assert.equal(code, 2);
  // The exit code alone is not enough: if someone moved the mkdir/writeFile
  // above the argument check, this test would still pass while the bad-args
  // path started emitting a bogus fragment.
  await assert.rejects(readFragment(dir, 'onlyalabel'));
});
