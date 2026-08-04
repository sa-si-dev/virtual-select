/** cSpell:ignore vscomp */

/**
 * Regression test for AI-19 / [A11Y-17] - WCAG 2.3.3 (AAA) and general motion hygiene.
 *
 * The open/close animation is driven from both CSS and JS, so it ignored the user's
 * OS-level reduced-motion preference in both places.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';

describe('A11y: prefers-reduced-motion (AI-19)', { testIsolation: true }, () => {
  const mountId = 'vs-reduced-motion';

  it('zeroes the JS-driven open/close durations when reduce is requested', () => {
    cy.viewport(1280, 800);
    cy.visit('get-started');

    cy.window().then((win) => {
      // Force the query to report "reduce" before the instance reads it.
      const originalMatchMedia = win.matchMedia.bind(win);

      win.matchMedia = ((query: string) =>
        query.includes('prefers-reduced-motion')
          ? ({
              matches: true,
              media: query,
              addEventListener() {},
              removeEventListener() {},
            } as unknown as MediaQueryList)
          : originalMatchMedia(query)) as typeof win.matchMedia;

      mountVs(win, mountId, { options: makeOptions(5) });
    });

    cy.get(`#${mountId}`).then(($e) => {
      const vs = $e[0].virtualSelect;

      expect(vs.showDuration, 'showDuration under reduced motion').to.equal(0);
      expect(vs.hideDuration, 'hideDuration under reduced motion').to.equal(0);
    });

    cy.window().then((win) => unmountVs(win, mountId));
  });

  it('keeps the configured durations when reduce is not requested', () => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => mountVs(win, mountId, { options: makeOptions(5) }));

    cy.get(`#${mountId}`).then(($e) => {
      const vs = $e[0].virtualSelect;

      expect(vs.showDuration, 'default showDuration').to.be.greaterThan(0);
      expect(vs.hideDuration, 'default hideDuration').to.be.greaterThan(0);
    });

    cy.window().then((win) => unmountVs(win, mountId));
  });

  it('ships a stylesheet rule that zeroes the transitions', () => {
    cy.visit('get-started');

    // Read the stylesheet the page actually loaded, rather than re-fetching the file: this
    // proves the rule survived the build and is live in the document.
    cy.document().then((doc) => {
      const sheets = Array.from(doc.styleSheets).filter((sheet) => (sheet.href || '').includes('virtual-select'));

      expect(sheets.length, 'the component stylesheet is loaded').to.be.greaterThan(0);

      const mediaRules = sheets.flatMap((sheet) => {
        try {
          return Array.from(sheet.cssRules);
        } catch {
          // cross-origin sheets are not readable; none of ours are
          return [];
        }
      });

      // Duck-typed rather than `instanceof CSSMediaRule`: spec code and the application run
      // in different realms, so the constructors are not the same object.
      const reducedMotion = mediaRules.filter((rule) =>
        String((rule as CSSMediaRule).conditionText || '').includes('prefers-reduced-motion'),
      ) as CSSMediaRule[];

      expect(reducedMotion.length, 'a prefers-reduced-motion block is present').to.be.greaterThan(0);
      expect(reducedMotion[0].cssText, 'it zeroes the transitions').to.include('transition-duration: 0s');
      expect(reducedMotion[0].cssText, 'it covers the dropbox').to.include('vscomp-dropbox');
    });
  });
});
