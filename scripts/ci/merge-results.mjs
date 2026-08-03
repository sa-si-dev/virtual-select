#!/usr/bin/env node
/**
 * Merge the fragment directory into results.json.
 * Usage: node scripts/ci/merge-results.mjs [inputDir] [outFile]
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { mergeResults } from './lib/results.mjs';

const [inputDir = 'ci-results', outFile = 'report/results.json'] = process.argv.slice(2);

const entries = await readdir(inputDir).catch(() => []);
const fragments = [];

for (const name of entries.filter((entry) => entry.endsWith('.json'))) {
  try {
    fragments.push(JSON.parse(await readFile(path.join(inputDir, name), 'utf8')));
  } catch (error) {
    // A corrupt fragment is treated as absent, which merges to `skipped`.
    console.warn(`Ignoring unreadable fragment ${name}: ${error.message}`);
  }
}

const merged = mergeResults(fragments);
await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, `${JSON.stringify(merged, null, 2)}\n`);

console.log(`Merged ${fragments.length} fragment(s) -> ${outFile} (conclusion: ${merged.conclusion})`);
