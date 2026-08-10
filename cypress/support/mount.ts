/** cSpell:ignore vscomp */

/**
 * Shared mount helper for the accessibility/security regression specs.
 *
 * The docs site is a docsify SPA, so these specs attach their own throwaway host element
 * rather than relying on a demo instance whose props may change with the documentation.
 * Mounting per-test keeps each assertion tied to an explicit, minimal configuration.
 */

export type VsOptions = Record<string, unknown>;

/** Remove a previously mounted host (and its instance) so specs can re-mount idempotently. */
export function unmountVs(win: Window, mountId: string): void {
  const existing = win.document.getElementById(mountId);

  if (!existing) {
    return;
  }

  // Destroy first: an orphaned instance keeps global listeners registered.
  const instance = (existing as unknown as { virtualSelect?: { destroy: () => void } }).virtualSelect;
  instance?.destroy();
  existing.remove();
}

/**
 * Create a fresh host element and initialise a VirtualSelect on it.
 *
 * `hostStyle` is applied to the host **before** `init()`, so the instance is built at the
 * geometry the test intends. Note `.vscomp-ele` ships `max-width: 250px`, so a test that wants a
 * wider host has to set `maxWidth` as well as `width` — setting `width` alone is silently capped.
 *
 * @returns the host element the instance was mounted on
 */
export function mountVs(
  win: Window,
  mountId: string,
  options: VsOptions,
  hostStyle?: Partial<CSSStyleDeclaration>,
): HTMLElement {
  unmountVs(win, mountId);

  const $ele = win.document.createElement('div');
  $ele.id = mountId;

  if (hostStyle) {
    Object.assign($ele.style, hostStyle);
  }

  win.document.body.appendChild($ele);

  // @ts-expect-error - VirtualSelect is attached to window by the bundle
  win.VirtualSelect.init({ ele: $ele, ...options });

  return $ele;
}

/** Build a simple list of `count` options, values `o1..oN`. */
export function makeOptions(count: number): Array<{ label: string; value: string }> {
  return Array.from({ length: count }, (_, i) => ({ label: `Option ${i + 1}`, value: `o${i + 1}` }));
}
