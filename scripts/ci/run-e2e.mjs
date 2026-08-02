#!/usr/bin/env node
/**
 * Serve the docs site, wait for it, run Cypress, always tear the server down.
 *
 * Replaces `docsify serve docs -p 3001 | cypress run`, which had no readiness
 * wait and never terminated because `docsify serve` does not exit.
 *
 * Usage: node scripts/ci/run-e2e.mjs
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { normalizeCypressResults } from './lib/e2e-normalize.mjs';

const require = createRequire(import.meta.url);

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;
const READY_TIMEOUT_MS = 60_000;
const READY_POLL_MS = 500;
const SHUTDOWN_GRACE_MS = 5000;
const OUT_DIR = process.env.CI_RESULTS_DIR ?? 'ci-results';

function startServer() {
  // Resolved rather than taken from PATH so this works without a shell.
  const docsifyBin = require.resolve('docsify-cli/bin/docsify');

  return spawn(process.execPath, [docsifyBin, 'serve', 'docs', '-p', String(PORT)], {
    stdio: 'ignore',
    shell: false,
  });
}

async function waitForServer(getSpawnError) {
  const deadline = Date.now() + READY_TIMEOUT_MS;

  while (Date.now() < deadline) {
    // Fail fast instead of polling for 60s against a child that never started.
    const spawnError = getSpawnError();
    if (spawnError) throw new Error(`docsify failed to start: ${spawnError.message}`);

    try {
      await fetch(BASE_URL, { signal: AbortSignal.timeout(2000) });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, READY_POLL_MS));
    }
  }

  throw new Error(`docsify did not accept connections on ${BASE_URL} within ${READY_TIMEOUT_MS}ms`);
}

async function stopServer(server) {
  if (server.exitCode !== null || server.signalCode !== null) return;

  const exited = new Promise((resolve) => server.once('close', resolve));
  server.kill('SIGTERM');

  const timer = setTimeout(() => server.kill('SIGKILL'), SHUTDOWN_GRACE_MS);
  await exited;
  clearTimeout(timer);
}

async function writeFragment(fragment) {
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, 'e2e.json'), `${JSON.stringify(fragment, null, 2)}\n`);
}

const startedAt = Date.now();
const server = startServer();
let fragment;

// A ChildProcess 'error' event with no listener is an uncaught exception. That
// would kill this process outside the try/finally below, so the server would
// never be torn down and no fragment would be written — the merge step would
// report E2E as `skipped` with no diagnosis instead of `failed` with the cause.
let spawnError = null;
server.once('error', (error) => {
  spawnError = error;
});

try {
  await waitForServer(() => spawnError);

  const cypress = (await import('cypress')).default;
  fragment = normalizeCypressResults(await cypress.run(), Date.now() - startedAt);
} catch (error) {
  fragment = {
    kind: 'e2e',
    label: 'E2E',
    outcome: 'failed',
    durationMs: Date.now() - startedAt,
    specs: [],
    outputTail: error.message,
  };
} finally {
  await stopServer(server);
}

await writeFragment(fragment);

console.log(`E2E ${fragment.outcome} in ${Math.round(fragment.durationMs / 1000)}s (${fragment.specs.length} spec(s))`);
process.exit(fragment.outcome === 'passed' ? 0 : 1);
