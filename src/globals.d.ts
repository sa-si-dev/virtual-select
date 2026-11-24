/** Page-level flags the tooltip add-on reads and writes. */
interface Window {
  /** Set by the external tooltip-plugin. While it is set the add-on stands down. */
  tooltipComponentInitiated?: boolean;
  /** The add-on's own load guard, so loading it twice registers its listeners once. */
  virtualSelectTooltipInitiated?: boolean;
}
