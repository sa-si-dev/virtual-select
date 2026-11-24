/** cSpell:ignore vscomp */

/**
 * Probe helpers for the dropbox placement characterization spec.
 *
 * They read the dropbox container through the instance (`$dropboxContainer`) because with
 * `dropboxWrapper: 'body'` the container is portalled out of the host element.
 */

export type DropboxSnapshot = {
  /** x, y parsed from the container's inline translate3d; [0, 0] when there is none. */
  transform: [number, number];
  /** 'top' | 'bottom' | 'left' | 'right' | '' (no position-* class). */
  side: string;
  /** Classes on the host starting with 'pop-comp-', sorted. */
  eleClasses: string[];
  /** Classes on the container starting with 'pop-comp-' or 'position-', sorted. */
  containerClasses: string[];
  /** Computed values of STYLE_PROPS. */
  style: Record<string, string>;
};

export const STYLE_PROPS = [
  'display',
  'position',
  'top',
  'left',
  'opacity',
  'color',
  'backgroundColor',
  'boxShadow',
  'textAlign',
  'flexWrap',
  'zIndex',
  'pointerEvents',
] as const;

const EVENT_NAMES = ['beforeOpen', 'afterOpen', 'beforeClose', 'afterClose'] as const;

type HostWithInstance = HTMLElement & { virtualSelect: { $dropboxContainer: HTMLElement } };

function getHost(win: Window, mountId: string): HostWithInstance {
  const host = win.document.getElementById(mountId) as HostWithInstance | null;

  if (!host) {
    throw new Error(`dropbox-probe: no host element with id "${mountId}"`);
  }

  return host;
}

function classesWithPrefix(element: Element, prefixes: string[]): string[] {
  return Array.from(element.classList)
    .filter((name) => prefixes.some((prefix) => name.startsWith(prefix)))
    .sort();
}

export function snapshotDropbox(win: Window, mountId: string): DropboxSnapshot {
  const host = getHost(win, mountId);
  const container = host.virtualSelect.$dropboxContainer;
  const containerClasses = classesWithPrefix(container, ['pop-comp-', 'position-']);
  const side = containerClasses.find((name) => name.startsWith('position-'))?.slice('position-'.length) ?? '';

  const match = /translate3d\(\s*(-?[\d.]+)px\s*,\s*(-?[\d.]+)px/.exec(container.style.transform);
  const transform: [number, number] = match ? [Number(match[1]), Number(match[2])] : [0, 0];

  const computed = win.getComputedStyle(container);
  const style: Record<string, string> = {};

  STYLE_PROPS.forEach((prop) => {
    style[prop] = computed[prop];
  });

  return {
    transform,
    side,
    eleClasses: classesWithPrefix(host, ['pop-comp-']),
    containerClasses,
    style,
  };
}

/** Listen for the open/close events on the host; the returned array fills in dispatch order. */
export function recordEvents(win: Window, mountId: string): string[] {
  const host = getHost(win, mountId);
  const events: string[] = [];

  EVENT_NAMES.forEach((name) => host.addEventListener(name, () => events.push(name)));

  return events;
}

/**
 * The docs page loads tooltip-plugin, which overwrites window.PopperComponent with an older
 * engine that yields fractional coordinates. Block it so the bundled engine is always used.
 * Call before every cy.visit().
 */
export function blockTooltipPlugin(): void {
  cy.intercept('GET', '**/assets/tooltip.min.js', { body: '' });
}
