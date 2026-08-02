/**
 * Validation for artifact content crossing the trust boundary.
 *
 * The artifact is produced by a workflow that ran PR-authored code, so every
 * byte here is untrusted. Anything that fails validation must abort the caller
 * without posting a comment.
 */

export const MAX_ARTIFACT_BYTES = 1024 * 1024;
const MAX_CHECKS = 64;
const SHA_PATTERN = /^[0-9a-f]{40}$/;

export function parseArtifactJson(name, raw) {
  const text = String(raw ?? '');

  if (Buffer.byteLength(text, 'utf8') > MAX_ARTIFACT_BYTES) {
    throw new Error(`${name}: exceeds ${MAX_ARTIFACT_BYTES} bytes`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${name}: malformed JSON`);
  }
}

function assertPlainObject(name, value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${name}: expected a JSON object`);
  }
}

export function validatePr(value) {
  assertPlainObject('pr.json', value);

  if (!Number.isInteger(value.number) || value.number <= 0) {
    throw new Error('pr.json: number must be a positive integer');
  }

  if (typeof value.headSha !== 'string' || !SHA_PATTERN.test(value.headSha)) {
    throw new Error('pr.json: headSha must be a 40-character lowercase hex sha');
  }

  return { number: value.number, headSha: value.headSha };
}

export function validateResults(value) {
  assertPlainObject('results.json', value);

  if (value.conclusion !== 'passed' && value.conclusion !== 'failed') {
    throw new Error('results.json: conclusion must be "passed" or "failed"');
  }

  if (!Array.isArray(value.checks)) {
    throw new Error('results.json: checks must be an array');
  }

  if (value.checks.length > MAX_CHECKS) {
    throw new Error(`results.json: too many checks (limit ${MAX_CHECKS})`);
  }

  for (const check of value.checks) {
    if (!check || typeof check.label !== 'string' || typeof check.outcome !== 'string') {
      throw new Error('results.json: bad check entry');
    }
  }

  return value;
}
