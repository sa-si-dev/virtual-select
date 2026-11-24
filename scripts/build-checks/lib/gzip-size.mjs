import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

/** Size in bytes of a file gzipped at the maximum compression level. */
export async function gzipSize(filePath) {
  return gzipSync(await readFile(filePath), { level: 9 }).length;
}
