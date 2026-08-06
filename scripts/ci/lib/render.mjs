/**
 * Render a validated report into the PR comment body.
 *
 * Everything that originated in the PR (check labels, spec names, assertion
 * output) is passed through the sanitizers before it reaches the output.
 */
import { cell, codeBlock } from './sanitize.mjs';

export const MARKER = '<!-- virtual-select-pr-tests -->';
export const MAX_COMMENT_CHARS = 55_000;

const ICON = { passed: '✅', failed: '❌', skipped: '⏭️' };

function icon(outcome) {
  return ICON[outcome] ?? '❔';
}

function duration(ms) {
  if (!ms) return '—';

  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;

  return `${Math.floor(seconds / 60)}m${String(seconds % 60).padStart(2, '0')}s`;
}

function rowsFor(check) {
  if (check.kind === 'e2e' && Array.isArray(check.specs) && check.specs.length > 0) {
    return check.specs.map((spec) => [
      cell(spec?.name),
      `${icon(spec?.outcome)} ${Number(spec?.passes) || 0}/${Number(spec?.tests) || 0}`,
      duration(spec?.durationMs),
    ]);
  }

  const status = check.outcome === 'skipped' ? `${icon('skipped')} skipped` : icon(check.outcome);
  return [[cell(check.label), status, duration(check.durationMs)]];
}

function failureBlocks(checks) {
  const blocks = [];

  for (const check of checks) {
    if (check.kind === 'e2e' && Array.isArray(check.specs) && check.specs.length > 0) {
      for (const spec of check.specs) {
        // Defense in depth: keep this guard even though validateResults now
        // schema-validates nested fields. renderComment is a pure helper that
        // may be reused directly, and malformed input must not crash reporting.
        const messages = Array.isArray(spec?.failureMessages) ? spec.failureMessages : [];

        for (const message of messages) {
          blocks.push(`${cell(spec?.name)}\n${codeBlock(message)}`);
        }
      }
    } else if (check.outcome === 'failed' && check.outputTail) {
      blocks.push(`${cell(check.label)}\n${codeBlock(check.outputTail)}`);
    }
  }

  return blocks;
}

export function renderComment({ results, headSha, runUrl, runNumber, hasScreenshots }) {
  const { conclusion, checks } = results;
  const failing = checks.filter((check) => check.outcome !== 'passed').length;

  const heading = conclusion === 'passed'
    ? '### PR Test Results — ✅ all checks passed'
    : `### PR Test Results — ❌ ${failing} failing`;

  const rows = checks.flatMap(rowsFor).map((columns) => `| ${columns.join(' | ')} |`);

  const footer = [
    `Tested commit: \`${cell(headSha).slice(0, 7)}\``,
    hasScreenshots ? 'Screenshots: `cypress-screenshots` artifact' : null,
    `[Run #${Number(runNumber) || 0}](${encodeURI(String(runUrl ?? ''))})`,
  ].filter(Boolean).join(' · ');

  const sections = [
    MARKER,
    heading,
    '',
    '| Check | Result | Time |',
    '|---|---|---|',
    ...rows,
    '',
  ];

  const blocks = failureBlocks(checks);
  if (blocks.length > 0) {
    sections.push('<details><summary>Failures</summary>', '', ...blocks.map((block) => {
      const [title, ...rest] = block.split('\n');
      return `**${title}**\n\n\`\`\`\n${rest.join('\n')}\n\`\`\`\n`;
    }), '</details>', '');
  }

  sections.push(footer);

  const body = sections.join('\n');
  if (body.length <= MAX_COMMENT_CHARS) return body;

  const keep = MAX_COMMENT_CHARS - footer.length - 64;
  let truncated = body.slice(0, keep);

  // The slice can land inside a fenced failure block. Left open, the fence
  // swallows the truncation notice and footer into the code block. Fence lines
  // are always exactly ``` on their own line (codeBlock neutralises any fence
  // inside untrusted content), so an odd count means one is open — close it.
  const fenceLine = '`'.repeat(3);
  const openFences = truncated.split('\n').filter((line) => line.trim() === fenceLine).length;
  if (openFences % 2 === 1) {
    truncated += `\n${fenceLine}`;
  }

  return `${truncated}\n\n_Output truncated to fit GitHub's comment limit._\n\n${footer}`;
}
