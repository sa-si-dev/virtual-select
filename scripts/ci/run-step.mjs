#!/usr/bin/env node
/**
 * Run one command, record how it went, and propagate its exit code.
 * Usage: node scripts/ci/run-step.mjs <label> <command> [args...]
 *
 * Spawned with `shell: false` so nothing in the argument list can be
 * interpreted by a shell.
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { slugify } from './lib/sanitize.mjs';

const OUTPUT_TAIL_LIMIT = 4000;
const OUT_DIR = process.env.CI_RESULTS_DIR ?? 'ci-results';

const [label, command, ...args] = process.argv.slice(2);

if (!label || !command) {
  console.error('usage: run-step.mjs <label> <command> [args...]');
  process.exit(2);
}

const startedAt = Date.now();
let outputTail = '';

function append(chunk) {
  process.stdout.write(chunk);
  outputTail = (outputTail + chunk).slice(-OUTPUT_TAIL_LIMIT);
}

const child = spawn(command, args, { shell: false });
child.stdout.on('data', append);
child.stderr.on('data', append);

const exitCode = await new Promise((resolve) => {
  child.on('error', (error) => {
    append(`\nFailed to start "${command}": ${error.message}\n`);
    resolve(1);
  });
  child.on('close', (code) => resolve(code ?? 1));
});

await mkdir(OUT_DIR, { recursive: true });
await writeFile(
  path.join(OUT_DIR, `step-${slugify(label)}.json`),
  `${JSON.stringify(
    {
      kind: 'step',
      label,
      outcome: exitCode === 0 ? 'passed' : 'failed',
      durationMs: Date.now() - startedAt,
      outputTail,
    },
    null,
    2,
  )}\n`,
);

process.exit(exitCode);
