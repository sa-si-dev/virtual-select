#!/usr/bin/env node
/**
 * Render the PR comment from a downloaded artifact.
 * Usage: node scripts/ci/render-comment.mjs <artifactDir> <outFile>
 *
 * Runs only in the trusted workflow. The artifact is untrusted input: it is
 * read by exact filename, size-capped, parsed defensively and shape-checked.
 * Any violation exits non-zero so the caller skips commenting entirely.
 */
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { renderComment } from './lib/render.mjs';
import { parseArtifactJson, validatePr, validateResults } from './lib/validate.mjs';

const [artifactDir, outFile] = process.argv.slice(2);

if (!artifactDir || !outFile) {
  console.error('usage: render-comment.mjs <artifactDir> <outFile>');
  process.exit(2);
}

async function readArtifact(name) {
  // Exact filenames only — the extraction directory is never globbed.
  return parseArtifactJson(name, await readFile(path.join(artifactDir, name), 'utf8'));
}

let pr;
let results;

try {
  pr = validatePr(await readArtifact('pr.json'));
  results = validateResults(await readArtifact('results.json'));
} catch (error) {
  console.error(`Refusing to render: ${error.message}`);
  process.exit(1);
}

const body = renderComment({
  results,
  headSha: process.env.HEAD_SHA ?? '',
  runUrl: process.env.RUN_URL ?? '',
  runNumber: process.env.RUN_NUMBER ?? '0',
  hasScreenshots: process.env.HAS_SCREENSHOTS === 'true',
});

await writeFile(outFile, body);

if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `pr_number=${pr.number}\nconclusion=${results.conclusion}\n`);
}

console.log(`Rendered ${body.length} chars for PR #${pr.number} (${results.conclusion})`);
