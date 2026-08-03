/**
 * Validation for artifact content crossing the trust boundary.
 *
 * The artifact is produced by a workflow that ran PR-authored code, so every
 * byte here is untrusted. Anything that fails validation must abort the caller
 * without posting a comment.
 */

export const MAX_ARTIFACT_BYTES = 1024 * 1024;
const MAX_CHECKS = 64;
const MAX_SPECS_PER_E2E = 256;
const MAX_FAILURE_MESSAGES_PER_SPEC = 256;
const MAX_LABEL_CHARS = 200;
const MAX_SPEC_NAME_CHARS = 512;
const MAX_OUTPUT_TAIL_CHARS = 200_000;
const MAX_FAILURE_MESSAGE_CHARS = 50_000;
const SHA_PATTERN = /^[0-9a-f]{40}$/;
const CHECK_OUTCOMES = new Set(['passed', 'failed', 'skipped']);
const SPEC_OUTCOMES = new Set(['passed', 'failed', 'skipped']);

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

function assertString(name, value, maxChars) {
  if (typeof value !== 'string') {
    throw new Error(`${name}: expected a string`);
  }

  if (value.length > maxChars) {
    throw new Error(`${name}: exceeds ${maxChars} chars`);
  }
}

function assertFiniteNumber(name, value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`${name}: expected a non-negative finite number`);
  }
}

function assertOutcome(name, value, allowedOutcomes) {
  if (typeof value !== 'string' || !allowedOutcomes.has(value)) {
    throw new Error(`${name}: invalid outcome "${String(value)}"`);
  }
}

function validateSpec(value, checkIndex, specIndex) {
  const scope = `results.json: checks[${checkIndex}].specs[${specIndex}]`;
  assertPlainObject(scope, value);
  assertString(`${scope}.name`, value.name, MAX_SPEC_NAME_CHARS);
  assertOutcome(`${scope}.outcome`, value.outcome, SPEC_OUTCOMES);
  assertFiniteNumber(`${scope}.tests`, value.tests);
  assertFiniteNumber(`${scope}.passes`, value.passes);
  assertFiniteNumber(`${scope}.failures`, value.failures);
  assertFiniteNumber(`${scope}.durationMs`, value.durationMs);

  if (!Array.isArray(value.failureMessages)) {
    throw new Error(`${scope}.failureMessages: expected an array`);
  }

  if (value.failureMessages.length > MAX_FAILURE_MESSAGES_PER_SPEC) {
    throw new Error(
      `${scope}.failureMessages: too many entries (limit ${MAX_FAILURE_MESSAGES_PER_SPEC})`,
    );
  }

  value.failureMessages.forEach((message, messageIndex) => {
    assertString(
      `${scope}.failureMessages[${messageIndex}]`,
      message,
      MAX_FAILURE_MESSAGE_CHARS,
    );
  });
}

function validateCheck(value, index) {
  const scope = `results.json: checks[${index}]`;
  assertPlainObject(scope, value);
  assertString(`${scope}.kind`, value.kind, 16);
  assertString(`${scope}.label`, value.label, MAX_LABEL_CHARS);
  assertOutcome(`${scope}.outcome`, value.outcome, CHECK_OUTCOMES);
  assertFiniteNumber(`${scope}.durationMs`, value.durationMs);

  if (value.kind === 'step') {
    assertString(`${scope}.outputTail`, value.outputTail, MAX_OUTPUT_TAIL_CHARS);
    return;
  }

  if (value.kind === 'e2e') {
    assertString(`${scope}.outputTail`, value.outputTail, MAX_OUTPUT_TAIL_CHARS);

    if (!Array.isArray(value.specs)) {
      throw new Error(`${scope}.specs: expected an array`);
    }

    if (value.specs.length > MAX_SPECS_PER_E2E) {
      throw new Error(`${scope}.specs: too many entries (limit ${MAX_SPECS_PER_E2E})`);
    }

    value.specs.forEach((spec, specIndex) => validateSpec(spec, index, specIndex));
    return;
  }

  throw new Error(`${scope}.kind: expected "step" or "e2e"`);
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

  value.checks.forEach((check, index) => validateCheck(check, index));

  return value;
}
