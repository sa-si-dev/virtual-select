/** cSpell:ignore vscomp */

/**
 * The shipped stylesheet must actually parse.
 *
 * Every other spec exercises behaviour, so none of them can see a rule that the CSS parser
 * silently discarded. That gap let a real defect through: Dart Sass prepends an encoding hint when
 * its output contains a non-ASCII character - a U+FEFF BOM in the compressed output we ship - and
 * `BannerPlugin` then prepends the licence banner in front of it. A BOM at position 0 is stripped
 * by every parser; mid-file it is a valid CSS *ident* code point, so the parser reads it as the
 * start of a selector, swallows the rule that follows and drops both.
 *
 * The casualty was `@keyframes vscomp-animation-spin`, the first rule after the banner, while
 * `.vscomp-options-loader::before` kept referencing it - so the options loader rendered as a
 * motionless arc and "loading" became indistinguishable from "hung". Any first rule is vulnerable;
 * the spinner was simply the one that happened to be there.
 *
 * These cases run against the built bundle the docs site loads, so they fail if the build
 * regresses, not merely if the source does.
 */

/** The stylesheet under test, as the docs site loads it. */
const STYLESHEET = 'virtual-select.min.css';

/** Our own sheet only - the docs page also loads fonts and vue.css. */
const ownStyleSheet = (win: Window): CSSStyleSheet => {
  const sheet = Array.from(win.document.styleSheets).find((s) => s.href?.includes(STYLESHEET));

  expect(sheet, `${STYLESHEET} is loaded by the page`).to.not.equal(undefined);

  return sheet as CSSStyleSheet;
};

/**
 * Fetch the stylesheet's source through the **browser**, using the `href` the page actually loaded.
 *
 * Not `cy.request('assets/…')`: `baseUrl` ends in `#/`, so a relative path resolves to the document
 * root and the server answers with `index.html`. An earlier version of this spec did that and its
 * assertions were green against a build carrying a BOM - they were inspecting the docs homepage, not
 * the stylesheet. Reading `sheet.href` cannot drift from what is under test.
 */
const fetchOwnStyleSheetText = (win: Window) =>
  cy.wrap(
    win
      .fetch(ownStyleSheet(win).href as string)
      .then((response) => {
        expect(response.ok, `${STYLESHEET} fetched`).to.equal(true);
        return response.text();
      }),
    { log: false },
  ) as unknown as Cypress.Chainable<string>;

describe('Build: the shipped stylesheet parses', { testIsolation: true }, () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('properties');
  });

  /**
   * Compares the file against the CSSOM instead of naming a rule. A mid-file BOM destroys
   * **whichever** rule follows the banner, so hard-coding today's first rule would stop guarding
   * anything the moment the partials are reordered. If the parser's first rule is not the file's
   * first rule, something was swallowed.
   */
  it('accepts the first rule in the file as its first rule', () => {
    cy.window().then((win) => {
      fetchOwnStyleSheetText(win).then((css) => {
        const afterBanner = css.slice(css.indexOf('*/') + 2);
        // No trim(): JS counts U+FEFF as whitespace, so trimming would discard the very
        // character that causes the defect.
        const fileFirstHead = afterBanner.slice(0, afterBanner.indexOf('{')).replace(/^[\s]+/, '').trim();

        const firstRule = ownStyleSheet(win).cssRules[0];
        const parsedFirstHead = firstRule.cssText.slice(0, firstRule.cssText.indexOf('{')).trim();

        // Normalised: the CSSOM re-serialises `@keyframes` and spacing in its own style.
        const normalise = (s: string) => s.replace(/\s+/g, ' ').toLowerCase();

        expect(normalise(parsedFirstHead), 'the parser kept the file first rule').to.equal(
          normalise(fileFirstHead),
        );
      });
    });
  });

  /**
   * The consequence check, derived from the file rather than hard-coded: every animation the
   * stylesheet references must resolve to a `@keyframes` the parser kept. A dangling
   * `animation-name` is silent at runtime - the element simply never animates - which is what made
   * the original defect invisible.
   */
  it('resolves every animation it references to a surviving keyframes rule', () => {
    cy.window().then((win) => {
      fetchOwnStyleSheetText(win).then((css) => {
        const referenced = new Set(
          [...css.matchAll(/animation(?:-name)?:([^;}]+)/g)]
            .flatMap((m) => m[1].split(/[\s,]+/))
            .filter((token) => new RegExp(`@(?:-\\w+-)?keyframes\\s+${token}\\b`).test(css)),
        );

        expect(referenced.size, 'the stylesheet references at least one animation').to.be.greaterThan(0);

        const survived = Array.from(ownStyleSheet(win).cssRules)
          .filter((rule) => rule.type === CSSRule.KEYFRAMES_RULE)
          .map((rule) => (rule as CSSKeyframesRule).name);

        referenced.forEach((name) => {
          expect(survived, `@keyframes ${name} survived parsing`).to.include(name);
        });
      });
    });
  });

  /** And the animation is actually applied - the CSSOM having the rule is necessary, not enough. */
  it('applies a surviving animation to the element that asks for it', () => {
    cy.window().then((win) => {
      const $loader = win.document.createElement('div');
      $loader.className = 'vscomp-options-loader';
      win.document.body.appendChild($loader);

      const { animationName, animationDuration } = win.getComputedStyle($loader, '::before');
      $loader.remove();

      expect(animationName, 'the loader names an animation').to.not.be.oneOf(['none', '']);
      expect(animationDuration, 'and it has a non-zero duration').to.not.equal('0s');

      const survived = Array.from(ownStyleSheet(win).cssRules)
        .filter((rule) => rule.type === CSSRule.KEYFRAMES_RULE)
        .map((rule) => (rule as CSSKeyframesRule).name);

      expect(survived, `the loader's animation "${animationName}" exists`).to.include(animationName);
    });
  });

  /**
   * The byte-level guards on the *cause* - no BOM, ASCII-only - live in
   * `scripts/build-checks/__tests__/stylesheet-bytes.test.mjs`, run by `npm run test:build`
   * immediately after the build. They read the artefact from disk, with no server or HTTP layer in
   * between, which is the most direct place to assert about bytes.
   *
   * What stays here is the half only a browser can answer: whether the rules survive *parsing*, and
   * whether the cue reaches the page. A file can be byte-perfect and still parse wrongly, and the
   * CSSOM is the only witness to that.
   */

  /** The cue itself must still reach the page - an ASCII escape the CSS parser decodes. */
  it('still renders the non-colour error cue', () => {
    cy.window().then((win) => {
      const $message = win.document.createElement('div');
      $message.className = 'vscomp-error-message';
      win.document.body.appendChild($message);

      const content = win.getComputedStyle($message, '::before').content;
      $message.remove();

      // Chrome resolves the escape, so the computed value is the character itself.
      expect(content, 'warning sign resolves from the \\26A0 escape').to.contain('⚠');
    });
  });
});
