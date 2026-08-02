/**
 * Pure string hardening for untrusted text that ends up in a PR comment.
 * Every export coerces its input and never throws.
 */

// Control characters except tab (09), line feed (0A) and carriage return (0D).
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const TRUNCATION_NOTICE = '… (truncated)';

// Built rather than written literally so this source file contains no raw fence
// delimiter, which keeps it safe to embed in documentation.
const FENCE = '`'.repeat(3);

export function stripControl(text) {
  return String(text ?? '').replace(CONTROL_CHARS, '');
}

export function stripMarkers(text) {
  return String(text ?? '').replaceAll('<!--', '').replaceAll('-->', '');
}

export function escapeHtml(text) {
  return String(text ?? '').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function truncate(text, max) {
  const value = String(text ?? '');
  return value.length <= max ? value : `${value.slice(0, max)}${TRUNCATION_NOTICE}`;
}

/** Render untrusted text safely inside a markdown table cell. */
export function cell(text, max = 120) {
  const clean = escapeHtml(stripMarkers(stripControl(text)))
    .replace(/\s+/g, ' ')
    .replaceAll('|', '\\|')
    .trim();

  return truncate(clean, max);
}

/**
 * Render untrusted text safely inside a fenced code block. HTML is left alone
 * because GitHub does not render markup inside fences; the fence delimiter is
 * neutralised so the text cannot break out.
 */
export function codeBlock(text, max = 2000) {
  return truncate(stripMarkers(stripControl(text)).replaceAll(FENCE, "'''"), max);
}

/** Turn a human check label into a filesystem-safe filename stem. */
export function slugify(label) {
  return String(label ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
