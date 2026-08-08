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

/** Rules whose absence would be invisible to a behavioural test. */
const REQUIRED_KEYFRAMES = 'vscomp-animation-spin';

describe('Build: the shipped stylesheet parses', { testIsolation: true }, () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('properties');
  });

  /** The reference and its target must both exist - a dangling animation-name is silent. */
  it('keeps the loader keyframes reachable from the rule that uses it', () => {
    cy.window().then((win) => {
      const keyframeNames: string[] = [];

      Array.from(win.document.styleSheets).forEach((sheet) => {
        let rules: CSSRuleList;

        try {
          rules = sheet.cssRules;
        } catch {
          // cross-origin sheet (fonts CDN) - not ours
          return;
        }

        Array.from(rules).forEach((rule) => {
          if (rule.type === CSSRule.KEYFRAMES_RULE) {
            keyframeNames.push((rule as CSSKeyframesRule).name);
          }
        });
      });

      expect(keyframeNames, `@keyframes ${REQUIRED_KEYFRAMES} survived parsing`).to.include(
        REQUIRED_KEYFRAMES,
      );

      const $loader = win.document.createElement('div');
      $loader.className = 'vscomp-options-loader';
      win.document.body.appendChild($loader);

      const animationName = win.getComputedStyle($loader, '::before').animationName;
      $loader.remove();

      expect(animationName, 'the loader still references it').to.equal(REQUIRED_KEYFRAMES);
    });
  });

  /**
   * The byte-level guards on the *cause* - no BOM, ASCII-only - deliberately live in
   * `scripts/ci/__tests__/stylesheet-bytes.test.mjs` instead of here. Written as `cy.request()`
   * they passed against a bundle that genuinely carried a BOM: the HTTP layer decodes the response
   * and strips it on the way through, including with `encoding: 'binary'`. That was verified, not
   * assumed - they were green against a known-bad build. Reading the built file from disk in the
   * Node suite is the only place those bytes are observable.
   *
   * What remains here is the half that only a browser can answer: whether the rule survives
   * parsing, and whether the cue still reaches the page.
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
