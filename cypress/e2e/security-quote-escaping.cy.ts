/** cSpell:ignore vscomp pwned */

/**
 * SEC-04 — quotes were escaped in the wrong place: in the stored text, not at the attribute.
 *
 * `secureText()` ran `replaceDoubleQuotesWithHTML()` over label/value/description *before*
 * handing the string to a text node, and the text node's `innerHTML` then escaped the `&` it
 * had just introduced. So with `enableSecureText: true` a label of `The "City" of Light` was
 * stored as `The &amp;quot;City&amp;quot; of Light`, rendered to the user as the visible
 * mojibake `The &quot;City&quot; of Light`, and - because `labelNormalized` derives from the
 * stored text - became unsearchable: neither `"City"` nor `&quot;City&quot;` matched anything.
 *
 * Escaping the source text also failed at what it was for. Quotes only matter inside an
 * attribute, and two attribute sinks take option text:
 *
 *   1. `data-value="${d.value}"` in `renderOptions()`, always;
 *   2. `data-tooltip="${label}"` via `getTooltipAttrText()` in the value-tag path, whose own
 *      escaping was conditional on `containsHTML(label)` - so a payload with no tag at all
 *      went in raw and put a live attribute on the tag element. (#487 later moved these
 *      attributes onto `.vscomp-value-tag-content`; the sink and its escaping are the same.)
 *
 * Sink 2 was a real breakout whenever escaping was off, and sink 1 whether it was on or off.
 * Pre-escaping the stored text only ever masked sink 2, and only in the escaping-on case.
 *
 * The fix moves the escaping to the boundary: `DomUtils.getAttributesText()` escapes every
 * value it writes, `data-value` is escaped at its interpolation, and `secureText()` stops
 * rewriting quotes. Attribute values round-trip through the parser, so `dataset.value` still
 * reads back the exact option value.
 */

import { mountVs, unmountVs } from '../support/mount';

describe('Security: quotes are escaped at the attribute, not in the stored text', () => {
  const mountId = 'vs-sec-quotes';
  const quotedLabel = 'The "City" of Light';
  const attrPayload = 'x" data-pwned="1" z="';
  const scriptPayload = '<img src=x onerror="window.__vsQuoteXss=true">';
  /** long enough that the tag needs a tooltip, which is what puts the label in an attribute */
  const longAttrPayload = `${attrPayload}${' padding to force overflow in a narrow field '.repeat(3)}`;

  const mount = (win: Window, options: Record<string, unknown>) => mountVs(win, mountId, options);

  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('get-started');
    cy.window().then((win) => {
      // @ts-expect-error - test marker
      win.__vsQuoteXss = undefined;
    });
  });

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  it('stores a quoted label verbatim when escaping is on', () => {
    cy.window().then((win) => {
      mount(win, { options: [{ label: quotedLabel, value: 'paris' }], enableSecureText: true });
    });

    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].virtualSelect.options[0].label, 'stored label').to.equal(quotedLabel);
    });
  });

  it('renders a quoted label as real quotes, not as &quot;', () => {
    cy.window().then((win) => {
      mount(win, { options: [{ label: quotedLabel, value: 'paris' }], enableSecureText: true });
    });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="paris"] .vscomp-option-text').should(($text) => {
      expect($text.text().trim()).to.equal(quotedLabel);
      expect($text.text()).to.not.contain('&quot;');
    });
  });

  it('finds a quoted phrase by searching for it', () => {
    cy.window().then((win) => {
      mount(win, {
        options: [
          { label: quotedLabel, value: 'paris' },
          { label: 'Lisbon', value: 'lisbon' },
        ],
        search: true,
        enableSecureText: true,
      });
    });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('.vscomp-search-input').type('"City"');
    cy.get(`#${mountId}`).find('.vscomp-option').should('have.length', 1);
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="paris"]').should('exist');
  });

  it('keeps a quoted description readable when escaping is on', () => {
    cy.window().then((win) => {
      mount(win, {
        options: [{ label: 'Paris', value: 'paris', description: 'He said "bonjour"' }],
        hasOptionDescription: true,
        enableSecureText: true,
      });
    });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('.vscomp-option-description').should(($d) => {
      expect($d.text().trim()).to.equal('He said "bonjour"');
      expect($d.text()).to.not.contain('&quot;');
    });
  });

  // data-value is the always-active attribute sink.
  [false, true].forEach((enableSecureText) => {
    it(`does not let a quoted value break out of data-value (enableSecureText: ${enableSecureText})`, () => {
      cy.window().then((win) => {
        mount(win, { options: [{ label: 'Payload', value: attrPayload }], enableSecureText });
      });

      cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
      cy.get(`#${mountId}`).find('.vscomp-option').should('have.length', 1);
      cy.get(`#${mountId}`).find('[data-pwned]').should('not.exist');

      // The parsed attribute must still equal the value, or selection by click breaks.
      cy.get(`#${mountId}`).find('.vscomp-option').should(($option) => {
        expect($option[0].dataset.value, 'data-value round-trip').to.equal(attrPayload);
      });
    });
  });

  it('still selects an option whose value contains a quote', () => {
    cy.window().then((win) => {
      mount(win, { options: [{ label: 'Payload', value: attrPayload }] });
    });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('.vscomp-option').click();

    cy.get(`#${mountId}`).should(($ele) => {
      expect($ele[0].virtualSelect.selectedValues).to.deep.equal([attrPayload]);
    });
  });

  // The value-tag tooltip is the second sink, and was unguarded whenever escaping was off.
  [false, true].forEach((enableSecureText) => {
    it(`does not let a quoted label break out of data-tooltip (enableSecureText: ${enableSecureText})`, () => {
      cy.window().then((win) => {
        const $ele = mount(win, {
          options: [{ label: longAttrPayload, value: 'v1' }],
          multiple: true,
          showValueAsTags: true,
          selectedValue: ['v1'],
          enableSecureText,
        });
        $ele.style.width = '150px';
      });

      cy.get(`#${mountId}`).find('[data-pwned]').should('not.exist');
      /** the attributes moved from `.vscomp-value-tag` to its content span in #487, so that
       *  tooltip-plugin evaluates ellipsis on the box that actually clips; the escaping path
       *  (`getAttributesText()`) and therefore this guarantee are unchanged */
      cy.get(`#${mountId}`)
        .find('.vscomp-value-tag .vscomp-value-tag-content')
        .should(($content) => {
          expect($content.attr('data-tooltip'), 'tooltip round-trip').to.equal(longAttrPayload);
        });
    });
  });

  it('still escapes markup in option text when escaping is on', () => {
    cy.window().then((win) => {
      mount(win, { options: [{ label: scriptPayload, value: 'p1' }], enableSecureText: true });
    });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('img[src="x"]').should('not.exist');
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="p1"] .vscomp-option-text').should('contain', 'img');

    cy.window().then((win) => {
      // @ts-expect-error - test marker
      expect(win.__vsQuoteXss, 'payload must not execute').to.not.eq(true);
    });
  });

  it('leaves non-string tooltip attribute values intact', () => {
    // getAttributesText() now stringifies before escaping. `Utils.getString(false)` returns '',
    // so using it there would have silently emptied the boolean tooltip attributes.
    cy.window().then((win) => {
      mount(win, { options: [{ label: 'Plain', value: 'p' }] });
    });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('.vscomp-option .vscomp-option-text').should(($text) => {
      expect($text.attr('data-tooltip-ellipsis-only')).to.equal('true');
      expect($text.attr('data-tooltip-allow-html')).to.equal('true');
      expect($text.attr('data-tooltip-enter-delay')).to.equal('200');
    });
  });

  it('still renders HTML labels as markup when escaping is off (unchanged default)', () => {
    cy.window().then((win) => {
      mount(win, { options: [{ label: '<b>Bold</b>', value: 'b1' }] });
    });

    cy.get(`#${mountId}`).find('.vscomp-toggle-button').click();
    cy.get(`#${mountId}`).find('.vscomp-option[data-value="b1"] b').should('contain', 'Bold');
  });
});
