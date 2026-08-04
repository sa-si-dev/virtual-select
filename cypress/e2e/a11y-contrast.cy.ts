/** cSpell:ignore vscomp */

/**
 * The default theme has to clear the AA contrast minimums on its own.
 *
 * Three cues were dimmed with `opacity` rather than coloured explicitly, which put them under
 * the minimum on the default white background: the placeholder resolved to #999 (2.85:1, needs
 * 4.5:1 as text), the clear and search-clear glyphs were #999 (2.85:1, needs 3:1 as non-text),
 * and the highlighted option was distinguished only by a #ccc fill (1.61:1 against the row
 * next to it), so the active row was not identifiable at all.
 *
 * WCAG 1.4.3 Contrast (Minimum) and 1.4.11 Non-text Contrast, both AA.
 */

import { makeOptions, mountVs, unmountVs } from '../support/mount';

const TEXT_MIN = 4.5;
const NON_TEXT_MIN = 3;

/** Parse a computed `rgb()`/`rgba()` value. Alpha is asserted to be 1 by the callers. */
const parseRgb = (value: string): [number, number, number, number] => {
  const parts = value.match(/[\d.]+/g);

  if (!parts || parts.length < 3) {
    throw new Error(`unexpected colour value: ${value}`);
  }

  return [Number(parts[0]), Number(parts[1]), Number(parts[2]), parts[3] === undefined ? 1 : Number(parts[3])];
};

/** WCAG relative luminance. */
const luminance = ([r, g, b]: [number, number, number, number]): number => {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (a: string, b: string): number => {
  const [la, lb] = [luminance(parseRgb(a)), luminance(parseRgb(b))];
  const [light, dark] = la > lb ? [la, lb] : [lb, la];

  return (light + 0.05) / (dark + 0.05);
};

describe('A11y: default theme contrast', { testIsolation: true }, () => {
  const mountId = 'vs-contrast';

  const mount = (extra: Record<string, unknown> = {}) => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => mountVs(win, mountId, { options: makeOptions(5), ...extra }));
  };

  /**
   * Computed style of the first match, resolved through the *application* window.
   * `window` inside a spec is the Cypress runner's own window, whose getComputedStyle knows
   * nothing about elements in the app frame.
   */
  const computed = (el: Element, pseudo?: string) =>
    (el.ownerDocument.defaultView as Window).getComputedStyle(el, pseudo);

  const styleOf = (selector: string) =>
    cy.get(`#${mountId}`).find(selector).first().then(($el) => computed($el[0]));

  /**
   * The colour actually behind `el`. Option rows declare no background of their own, so their
   * computed `background-color` is `rgba(0,0,0,0)`; measuring against that would score every
   * cue against black and pass or fail for the wrong reason. Walk up to the first opaque
   * ancestor instead - the dropbox, in practice.
   */
  const effectiveBackground = (el: Element | null): string => {
    for (let node = el; node; node = node.parentElement) {
      const background = computed(node).backgroundColor;

      if (parseRgb(background)[3] === 1) {
        return background;
      }
    }

    return 'rgb(255, 255, 255)';
  };

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  it('gives the placeholder enough contrast to be read as text', () => {
    mount({ placeholder: 'Select an option' });

    cy.get(`#${mountId}`).find('.vscomp-wrapper').should('not.have.class', 'has-value');

    styleOf('.vscomp-value').then((valueStyle) => {
      // Opacity would dim the text against whatever is behind it, defeating the colour check.
      expect(Number(valueStyle.opacity), 'placeholder opacity').to.equal(1);

      styleOf('.vscomp-toggle-button').then((buttonStyle) => {
        expect(contrast(valueStyle.color, buttonStyle.backgroundColor), 'placeholder vs field').to.be.at.least(
          TEXT_MIN,
        );
      });
    });
  });

  it('gives the clear button glyph enough contrast to be seen as a control', () => {
    mount({ placeholder: 'Select an option' });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="o1"]').click();
    cy.get(`#${mountId}`).find('.vscomp-clear-button').should('be.visible');

    cy.get(`#${mountId}`)
      .find('.vscomp-clear-icon')
      .first()
      .then(($icon) => {
        const glyph = computed($icon[0], '::before').backgroundColor;
        const field = computed($icon[0].closest('.vscomp-toggle-button') as Element).backgroundColor;

        expect(contrast(glyph, field), 'clear glyph vs field').to.be.at.least(NON_TEXT_MIN);
      });
  });

  it('gives the search clear glyph enough contrast', () => {
    mount({ search: true });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();

    styleOf('.vscomp-search-clear').then((clearStyle) => {
      styleOf('.vscomp-dropbox').then((dropboxStyle) => {
        expect(contrast(clearStyle.color, dropboxStyle.backgroundColor), 'search clear vs dropbox').to.be.at.least(
          NON_TEXT_MIN,
        );
      });
    });
  });

  it('identifies the highlighted option with a cue that reaches 3:1 against its neighbours', () => {
    mount({ search: true });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).pressKeys('ArrowDown');
    cy.get(`#${mountId}`).find('.vscomp-option.focused').should('exist');

    cy.get(`#${mountId}`)
      .find('.vscomp-option.focused')
      .first()
      .then(($focused) => {
        const focusedStyle = computed($focused[0]);
        const neighbour = $focused[0].nextElementSibling as Element;
        const neighbourBg = effectiveBackground(neighbour);

        expect(focusedStyle.outlineStyle, 'ring style').to.not.equal('none');
        expect(parseFloat(focusedStyle.outlineWidth), 'ring width').to.be.at.least(2);

        // The ring is what carries the state, so it is measured against both the row it sits
        // in and the row beside it - either one could otherwise hide it.
        expect(contrast(focusedStyle.outlineColor, focusedStyle.backgroundColor), 'ring vs own row').to.be.at.least(
          NON_TEXT_MIN,
        );
        expect(contrast(focusedStyle.outlineColor, neighbourBg), 'ring vs next row').to.be.at.least(NON_TEXT_MIN);
      });
  });

  it('keeps the option label readable on the highlighted row', () => {
    // Darkening the highlight fill instead of adding a ring would have traded a 1.4.11 failure
    // for a 1.4.3 one; this pins that it did not happen.
    mount({ search: true });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).pressKeys('ArrowDown');

    cy.get(`#${mountId}`)
      .find('.vscomp-option.focused')
      .first()
      .then(($focused) => {
        const style = computed($focused[0]);

        expect(contrast(style.color, style.backgroundColor), 'option label vs highlighted row').to.be.at.least(
          TEXT_MIN,
        );
      });
  });

  it('still fills the highlighted row differently from an unhighlighted one', () => {
    mount({ search: true });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).pressKeys('ArrowDown');

    cy.get(`#${mountId}`)
      .find('.vscomp-option.focused')
      .first()
      .then(($focused) => {
        const focusedBg = computed($focused[0]).backgroundColor;
        const neighbourBg = effectiveBackground($focused[0].nextElementSibling);

        expect(focusedBg, 'highlighted fill').to.not.equal(neighbourBg);
      });
  });
});
