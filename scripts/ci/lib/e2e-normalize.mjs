/**
 * Turn a Cypress Module API result into a report fragment.
 *
 * `cypress.run()` does not reject on failure. Spec failures resolve with a
 * `runs` array and a non-zero `totalFailed`; a runner that cannot launch at all
 * resolves with `{ status: 'failed', message }` and no `runs` array. Both shapes
 * must produce a fragment — never an exception.
 */

function normalizeSpec(run) {
  const stats = run?.stats ?? {};
  const failures = stats.failures ?? 0;

  return {
    name: run?.spec?.name ?? 'unknown',
    outcome: failures > 0 ? 'failed' : 'passed',
    tests: stats.tests ?? 0,
    passes: stats.passes ?? 0,
    failures,
    durationMs: stats.duration ?? 0,
    failureMessages: (run?.tests ?? [])
      .filter((testCase) => testCase?.state === 'failed')
      .map((testCase) => `${(testCase.title ?? []).join(' > ')}\n${testCase.displayError ?? ''}`.trim()),
  };
}

export function normalizeCypressResults(results, durationMs) {
  if (!results || !Array.isArray(results.runs)) {
    return {
      kind: 'e2e',
      label: 'E2E',
      outcome: 'failed',
      durationMs,
      specs: [],
      outputTail: results?.message ?? 'Cypress produced no runs.',
    };
  }

  return {
    kind: 'e2e',
    label: 'E2E',
    outcome: (results.totalFailed ?? 0) > 0 ? 'failed' : 'passed',
    durationMs,
    specs: results.runs.map(normalizeSpec),
    outputTail: '',
  };
}
