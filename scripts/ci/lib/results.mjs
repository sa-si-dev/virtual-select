/**
 * Pure merge of per-job result fragments into one ordered report.
 *
 * Fragments are produced on different runners and arrive as a flat directory of
 * JSON files, so they are matched by their `label` property rather than by
 * filename. Anything the canonical list expects but does not receive is
 * synthesized as `skipped` — that is how a crashed or timed-out job surfaces.
 */

export const CANONICAL_CHECKS = ['Typecheck', 'ESLint', 'Stylelint', 'CI Scripts', 'Build', 'E2E'];

function isFragment(value) {
  return Boolean(value) && typeof value === 'object' && typeof value.label === 'string';
}

export function mergeResults(fragments) {
  const byLabel = new Map();

  for (const fragment of Array.isArray(fragments) ? fragments : []) {
    if (isFragment(fragment)) {
      byLabel.set(fragment.label, fragment);
    }
  }

  const checks = CANONICAL_CHECKS.map(
    (label) => byLabel.get(label) ?? { kind: 'step', label, outcome: 'skipped', durationMs: 0, outputTail: '' },
  );

  // `skipped` counts as not-passing on purpose: a job killed by its timeout
  // contributes no fragment, and that must never render as a green report.
  const conclusion = checks.every((check) => check.outcome === 'passed') ? 'passed' : 'failed';

  return { conclusion, checks };
}
