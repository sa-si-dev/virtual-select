/** cSpell:ignore vscomp */

/**
 * The opt-in tooltip add-on (`virtual-select-tooltip.min.js` + `.min.css`), which replaces the
 * external tooltip-plugin. The docs page loads it, so these cases drive it through the same
 * delegated `mouseover` / `mouseout` events a pointer produces.
 *
 * `testIsolation: true` matters here: the add-on's document listeners and its load guard live on
 * the window, so every case starts from a freshly loaded page.
 *
 * "Not shown" waits out the core's 200ms `data-tooltip-enter-delay` (and the 200ms hide) before
 * asserting, and is asserted on visibility: a hidden tooltip is `display: none`, not removed.
 */

import { mountVs, unmountVs } from '../support/mount';

const mountId = 'vs-tooltip-addon';
const labels = ['A first label the tag cannot show in full', 'A second label the tag cannot show either'];

const tagContent = () => cy.get(`#${mountId} .vscomp-value-tag[data-index] .vscomp-value-tag-content`);

const hover = ($el: JQuery<HTMLElement>) => cy.wrap($el).trigger('mouseover', { force: true });
const unhover = ($el: JQuery<HTMLElement>) => cy.wrap($el).trigger('mouseout', { force: true });

const isClipped = ($el: HTMLElement) => $el.scrollWidth > $el.offsetWidth;

const assertShown = (text: string) => cy.get('.tooltip-comp').should('be.visible').and('contain.text', text);

const assertNotShown = () => {
  cy.wait(400);
  cy.get('body').should(($body) => {
    expect($body.find('.tooltip-comp:visible'), 'no visible tooltip').to.have.length(0);
  });
};

/** A bubbling mouse event built in the page's realm, for sequences too fast for cy.trigger(). */
const mouse = (win: Window, $el: Element, type: string, relatedTarget: EventTarget | null = null) =>
  $el.dispatchEvent(new (win as Window & typeof globalThis).MouseEvent(type, { bubbles: true, relatedTarget }));

const optionText = () =>
  cy.get(`#${mountId} .vscomp-option[data-index="0"] .vscomp-option-text`).should(($text) => {
    expect(isClipped($text[0]), 'precondition: the option text is clipped').to.equal(true);
  });

/** Opens the dropdown and waits for afterOpen, which re-renders the options (selected first). */
const openSettled = () => {
  cy.get(`#${mountId}`).then(($host) => $host[0].open?.());
  cy.get(`#${mountId} .vscomp-wrapper`).should('have.class', 'focused');
};

const scrollOptions = () =>
  cy.get(`#${mountId} .vscomp-options-container`).then(($container) => {
    $container[0].dispatchEvent(new Event('scroll'));
  });

function visitAndMount() {
  cy.viewport(1280, 800);
  cy.visit('properties');

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
      { width: '120px', maxWidth: '120px' },
    ),
  );

  tagContent().should(($contents) => {
    expect($contents, 'two tags').to.have.length(2);
    $contents.each((_i, $content) => {
      expect(isClipped($content), 'precondition: every tag is clipped').to.equal(true);
    });
  });
}

describe('Tooltip add-on', { testIsolation: true }, () => {
  beforeEach(visitAndMount);

  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  it('renders the tooltip node with the trigger options applied', () => {
    tagContent().first().then(hover);
    assertShown(labels[0]);

    tagContent()
      .first()
      .then(($trigger) => {
        const { dataset } = $trigger[0];

        cy.get('.tooltip-comp').should(($tooltip) => {
          const node = $tooltip[0];

          expect(node.parentElement, 'appended to body').to.equal(node.ownerDocument.body);
          expect(node.querySelector(':scope > i.tooltip-comp-arrow'), 'arrow').to.not.equal(null);
          expect(node.querySelector(':scope > .tooltip-comp-content'), 'content').to.not.equal(null);
          expect(
            node.classList.contains('position-top') || node.classList.contains('position-bottom'),
            'position-top or position-bottom',
          ).to.equal(true);
          expect(node.style.zIndex, 'z-index').to.equal(dataset.tooltipZIndex);
          expect(node.style.fontSize, 'font-size').to.equal(dataset.tooltipFontSize);
          expect(node.style.textAlign, 'text-align').to.equal(dataset.tooltipAlignment);
          expect(node.style.maxWidth, 'max-width').to.equal(dataset.tooltipMaxWidth);
        });
      });
  });

  it('ignores [data-tooltip] elements outside Virtual Select', () => {
    cy.window().then((win) => {
      const $span = win.document.createElement('span');
      $span.id = `${mountId}-outside`;
      $span.dataset.tooltip = 'x';
      $span.textContent = 'outside';
      win.document.body.appendChild($span);
    });

    cy.get(`#${mountId}-outside`).then(hover);
    assertNotShown();
  });

  it('stands down while tooltip-plugin is on the page', () => {
    cy.window().then((win) => {
      win.tooltipComponentInitiated = true;
    });

    tagContent().first().then(hover);
    assertNotShown();
  });

  /** A trigger inside the instance whose tooltip is `<b>x</b>`, with the given allow-html value. */
  const addMarkupTrigger = (allowHtml: 'true' | 'false') => {
    cy.get(`#${mountId} .vscomp-wrapper`).then(($wrapper) => {
      const $span = $wrapper[0].ownerDocument.createElement('span');
      $span.id = `${mountId}-markup`;
      $span.textContent = 'markup';
      $span.setAttribute('data-tooltip', '<b>x</b>');
      $span.setAttribute('data-tooltip-allow-html', allowHtml);
      $wrapper[0].appendChild($span);
    });
  };

  it('renders the text as text, not markup, unless allow-html is true', () => {
    addMarkupTrigger('false');

    cy.get(`#${mountId}-markup`).then(hover);
    cy.get('.tooltip-comp .tooltip-comp-content').should(($content) => {
      expect($content[0].textContent).to.equal('<b>x</b>');
      expect($content[0].querySelector('b'), 'no <b> element').to.equal(null);
    });
  });

  it('renders the markup when allow-html is true', () => {
    addMarkupTrigger('true');

    cy.get(`#${mountId}-markup`).then(hover);
    cy.get('.tooltip-comp .tooltip-comp-content').should(($content) => {
      const $bold = $content[0].querySelector('b');

      expect($bold, 'a <b> element').not.to.equal(null);
      expect($bold?.textContent, 'its text').to.equal('x');
    });
  });

  it('hides on click', () => {
    tagContent().first().then(hover);
    assertShown(labels[0]);

    tagContent().first().trigger('click', { force: true });
    assertNotShown();
  });

  it('hides when the options container holding the trigger scrolls', () => {
    openSettled();
    optionText().then(hover);
    assertShown(labels[0]);

    scrollOptions();
    assertNotShown();
  });

  /**
   * The core re-renders the options after every open (selected first). A trigger replaced during
   * the enter delay would measure as a 0x0 box, pinning the tooltip to the viewport's corner.
   */
  it('shows nothing for a trigger replaced during the enter delay, then follows the new one', () => {
    openSettled();
    optionText().then(($text) => {
      const win = $text[0].ownerDocument.defaultView as Window;

      mouse(win, $text[0], 'mouseover');
      $text[0].replaceWith($text[0].cloneNode(true));
    });
    assertNotShown();

    optionText().then(hover);
    assertShown(labels[0]);
    optionText().then(($text) => {
      const option = $text[0].getBoundingClientRect();

      cy.get('.tooltip-comp').should(($tooltip) => {
        const tooltip = $tooltip[0].getBoundingClientRect();
        const gap = tooltip.top >= option.bottom ? tooltip.top - option.bottom : option.top - tooltip.bottom;

        expect(gap, '8px from the new option once the show transition ends').to.be.within(7, 9);
        expect(tooltip.right > option.left && tooltip.left < option.right, 'horizontally over the option').to.equal(
          true,
        );
      });
    });
  });

  it('hides on scroll once its shown trigger has been replaced', () => {
    openSettled();
    optionText().then(hover);
    assertShown(labels[0]);

    optionText().then(($text) => $text[0].replaceWith($text[0].cloneNode(true)));
    scrollOptions();
    assertNotShown();
  });

  it('keeps a single tooltip node in the document', () => {
    tagContent().first().then(hover);
    assertShown(labels[0]);
    tagContent().first().then(unhover);

    tagContent().last().then(hover);
    assertShown(labels[1]);
    cy.get('body').find('.tooltip-comp').should('have.length', 1);
  });

  it('shows only the last trigger of a fast sweep', () => {
    cy.window().then((win) => {
      const [first, second] = win.document.querySelectorAll(
        `#${mountId} .vscomp-value-tag[data-index] .vscomp-value-tag-content`,
      );

      mouse(win, first, 'mouseover');
      mouse(win, first, 'mouseout');
      mouse(win, second, 'mouseover');
    });

    cy.wait(600);
    cy.get('body').should(($body) => {
      const $visible = $body.find('.tooltip-comp:visible');

      expect($visible, 'exactly one visible tooltip').to.have.length(1);
      expect($visible.text()).to.contain(labels[1]);
    });
  });

  it('hides when the trigger left the DOM, and the next hover still works', () => {
    tagContent().first().then(hover);
    assertShown(labels[0]);

    cy.window().then((win) => {
      win.document.querySelector(`#${mountId} .vscomp-value-tag[data-index] .vscomp-value-tag-content`)?.remove();
      mouse(win, win.document.body, 'mouseout', null);
    });
    assertNotShown();

    tagContent().last().then(hover);
    assertShown(labels[1]);
  });

  it('registers once when loaded twice', () => {
    cy.window().then(
      (win) =>
        new Cypress.Promise((resolve, reject) => {
          const $script = win.document.createElement('script');
          $script.src = 'assets/virtual-select-tooltip.min.js';
          $script.onload = resolve;
          $script.onerror = () => reject(new Error('the add-on did not load a second time'));
          win.document.body.appendChild($script);
        }),
    );

    tagContent().first().then(hover);
    assertShown(labels[0]);
    cy.get('body').find('.tooltip-comp').should('have.length', 1);
  });

  it('does not animate under prefers-reduced-motion', () => {
    cy.window().then((win) => {
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
    });

    tagContent().first().then(hover);
    assertShown(labels[0]);
    cy.get('.tooltip-comp').should(($tooltip) => {
      expect($tooltip[0].style.transitionDuration).to.equal('0ms');
    });
  });

  it('assigns no shared popper or popover global', () => {
    cy.window().then((win) => {
      const globals = win as unknown as Record<string, unknown>;

      expect(globals.PopperComponent, 'PopperComponent').to.equal(undefined);
      expect(globals.PopoverComponent, 'PopoverComponent').to.equal(undefined);
    });
  });
});

describe('Without the tooltip add-on', { testIsolation: true }, () => {
  afterEach(() => {
    cy.window().then((win) => unmountVs(win, mountId));
  });

  /** OutSystems UI's configuration: the core alone, tooltip attributes and no add-on. */
  it('shows no tooltip and throws nothing', () => {
    cy.intercept('GET', '**/assets/virtual-select-tooltip.min.js', { body: '' });
    visitAndMount();

    tagContent().first().then(hover);
    cy.wait(400);
    cy.get('.tooltip-comp').should('not.exist');
  });
});
