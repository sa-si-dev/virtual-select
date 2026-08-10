/** cSpell:ignore vscomp */

/**
 * Issue #487 — with `showValueAsTags: true`, a tag should show a tooltip exactly when its
 * rendered text is clipped.
 *
 * The old check measured the label off-screen against `.vscomp-toggle-button` (wrong box: ~73px
 * wider than the space the text really gets) using that element's font (wrong size: 14px vs the
 * tag's 12px), before the tag existed. Tags that visibly truncate could miss their tooltip and
 * tags that fit could get one.
 *
 * The tooltip now sits on `.vscomp-value-tag-content` with `data-tooltip-ellipsis-only`, so
 * tooltip-plugin runs `scrollWidth > offsetWidth` on the real box at hover time.
 *
 * These cases assert what the user experiences — whether a tooltip *appears on hover* — rather
 * than the presence of an attribute, so they hold regardless of which side computes the overflow.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';

const mountId = 'vs-tag-tooltip';

/** `.vscomp-ele` caps at 250px, so a wider host needs maxWidth lifted too. */
const host = (width: string) => ({ width, maxWidth: width });

const tagContent = () => cy.get(`#${mountId} .vscomp-value-tag[data-index] .vscomp-value-tag-content`);

/** tooltip-plugin listens for delegated `mouseover`, so a real bubbling event is what shows it. */
const hover = ($el: JQuery<HTMLElement>) => cy.wrap($el).trigger('mouseover', { force: true });
const unhover = ($el: JQuery<HTMLElement>) => cy.wrap($el).trigger('mouseout', { force: true });

const assertTooltipShows = (text: string) =>
  cy.get('.tooltip-comp').should('be.visible').and('contain.text', text);

/**
 * Two traps here, both learned from watching this fail:
 *
 * - `tooltipEnterDelay` is 200ms, so "no tooltip" has to outlast it — asserting straight after the
 *   hover would pass before the tooltip had any chance to appear.
 * - hiding is `display: none`, not removal (tooltip-plugin only removes the node when the *next*
 *   tooltip is built), so once any tooltip has been shown the node stays in the DOM. Absence has
 *   to be asserted on visibility, not existence.
 */
const TOOLTIP_ENTER_DELAY = 200;
const assertNoTooltipShows = () => {
  cy.wait(TOOLTIP_ENTER_DELAY * 2);
  cy.get('body').should(($body) => {
    expect($body.find('.tooltip-comp:visible'), 'no visible tooltip').to.have.length(0);
  });
};

const isClipped = ($el: HTMLElement) => $el.scrollWidth > $el.offsetWidth;

describe('Tag tooltips reflect real overflow (#487)', { testIsolation: true }, () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('properties');
  });

  afterEach(() => {
    cy.window().then((win) => {
      unmountVs(win, mountId);
      win.document.getElementById(`${mountId}-css`)?.remove();
    });
  });

  /**
   * A graded range of label lengths, so the invariant cannot be satisfied by accident at one
   * particular width: whichever labels the 250px host happens to clip must be exactly the ones
   * that get a tooltip.
   */
  it('shows a tooltip on every clipped tag and on no tag that fits', () => {
    const labels = Array.from({ length: 24 }, (_, i) => `Tag ${'ab'.repeat(i)}`);

    cy.window().then((win) =>
      mountVs(
        win,
        mountId,
        {
          options: labels.map((label, i) => ({ label, value: `o${i}` })),
          multiple: true,
          showValueAsTags: true,
          selectedValue: labels.map((_l, i) => `o${i}`),
        },
        host('250px'),
      ),
    );

    tagContent().should('have.length', labels.length);

    // Both outcomes must occur, otherwise the case would pass vacuously.
    tagContent().then(($contents) => {
      const clipped = $contents.toArray().filter(isClipped).length;

      expect(clipped, 'some tags are clipped').to.be.greaterThan(0);
      expect(clipped, 'some tags are not clipped').to.be.lessThan($contents.length);
    });

    tagContent().each(($content) => {
      const clipped = isClipped($content[0]);

      hover($content);

      if (clipped) {
        assertTooltipShows($content.text().trim());
      } else {
        assertNoTooltipShows();
      }

      unhover($content);
      cy.get('body').should(($body) => {
        expect($body.find('.tooltip-comp:visible'), 'tooltip hides again').to.have.length(0);
      });
    });
  });

  /**
   * Consumer CSS narrows the tag while the toggle button stays wide — the split the old
   * measurement was blind to, since it only ever looked at the button.
   */
  it('sees clipping introduced by consumer CSS on the tag itself', () => {
    cy.window().then((win) => {
      const $style = win.document.createElement('style');
      $style.id = `${mountId}-css`;
      $style.textContent = `#${mountId} .vscomp-value-tag { max-width: 120px; }`;
      win.document.head.appendChild($style);

      mountVs(
        win,
        mountId,
        {
          options: [{ label: 'A label the tag cannot show in full', value: 'o1' }],
          multiple: true,
          showValueAsTags: true,
          selectedValue: ['o1'],
        },
        host('600px'),
      );
    });

    tagContent().should(($content) => {
      expect(isClipped($content[0]), 'precondition: the tag really is clipped').to.equal(true);
    });

    tagContent().then(hover);
    assertTooltipShows('A label the tag cannot show in full');
  });

  /**
   * Regression guard for the review finding on the first attempt at this fix: computing overflow
   * at render time yields 0/0 inside a hidden container, so every tag silently lost its tooltip
   * and nothing recomputed when it became visible. Deferring to hover cannot have that failure.
   */
  it('still shows tooltips for a control first rendered inside a hidden container', () => {
    cy.window().then((win) => {
      const $host = mountVs(
        win,
        mountId,
        {
          options: [{ label: 'A label the tag cannot show in full at this width', value: 'o1' }],
          multiple: true,
          showValueAsTags: true,
          selectedValue: ['o1'],
        },
        { ...host('250px'), display: 'none' },
      );

      // Rendered while hidden, then revealed — no re-render in between.
      $host.style.display = '';
    });

    tagContent().should(($content) => {
      expect(isClipped($content[0]), 'precondition: the tag is clipped once visible').to.equal(true);
    });

    tagContent().then(hover);
    assertTooltipShows('A label the tag cannot show in full at this width');
  });

  it('uses the selectedLabelRenderer output as the tooltip text', () => {
    cy.window().then((win) => {
      const $style = win.document.createElement('style');
      $style.id = `${mountId}-css`;
      $style.textContent = `#${mountId} .vscomp-value-tag { max-width: 120px; }`;
      win.document.head.appendChild($style);

      mountVs(
        win,
        mountId,
        {
          options: [{ label: 'A label the tag cannot show in full', value: 'o1' }],
          multiple: true,
          showValueAsTags: true,
          selectedValue: ['o1'],
          selectedLabelRenderer: (option: { label: string }) => `${option.label} (rendered)`,
        },
        host('600px'),
      );
    });

    tagContent().then(hover);
    assertTooltipShows('A label the tag cannot show in full (rendered)');
  });

  it('leaves the "+ n more" counter tag without a tooltip', () => {
    cy.window().then((win) =>
      mountVs(
        win,
        mountId,
        {
          options: makeOptions(6),
          multiple: true,
          showValueAsTags: true,
          noOfDisplayValues: 3,
          selectedValue: ['o1', 'o2', 'o3', 'o4', 'o5', 'o6'],
        },
        host('250px'),
      ),
    );

    cy.get(`#${mountId} .vscomp-value-tag.more-value-count`)
      .should('exist')
      .should('not.have.attr', 'data-tooltip');
  });

  /** The rendered box is the measurement now, so no off-screen measurer node may exist. */
  it('creates no shared off-screen measurer node', () => {
    cy.window().then((win) =>
      mountVs(
        win,
        mountId,
        {
          options: makeOptions(5),
          multiple: true,
          showValueAsTags: true,
          selectedValue: ['o1', 'o2', 'o3'],
        },
        host('250px'),
      ),
    );

    tagContent().should('have.length', 3);
    cy.get('.vscomp-text-measurer').should('not.exist');
  });
});
