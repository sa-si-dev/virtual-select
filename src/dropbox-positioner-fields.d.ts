/**
 * Instance fields of DropboxPositioner. The constructor copies its options with
 * Object.assign(this, options), and the rest are written before they are first read, so they are
 * declared here rather than in the class: a JSDoc-only declaration statement would still ship.
 */
import type { DropboxPositionerOptions } from './dropbox-positioner';

declare module './dropbox-positioner' {
  interface DropboxPositioner extends Omit<DropboxPositionerOptions, 'zIndex' | 'throttle'> {
    timer: ReturnType<typeof setTimeout> | undefined;
    /** the last placement computed (set by place()): side, final translate and from-translate */
    side: string;
    x: number;
    y: number;
    fromX: number;
    fromY: number;
  }
}
