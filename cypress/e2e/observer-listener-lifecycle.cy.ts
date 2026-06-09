/** cSpell:ignore vscomp */

// Tests for the lifecycle follow-ups to the memory-leak / performance series:
//   1. The shared MutationObserver and the page-level resize/reset/submit listeners are
//      attached lazily on the first instance and torn down when the last instance is destroyed
//      (VirtualSelect.domObserver === null, hasGlobalListeners === false), then re-established
//      when a new instance appears.
//   2. Utils.throttle().cancel() (reachable via the public VirtualSelect.onResizeThrottled)
//      clears a pending trailing call so it cannot fire after the listener is detached.

describe('Lifecycle: ref-counted observer/listeners + throttle cancel', () => {
  const mountId = 'vs-lifecycle';

  const mount = (win: Window) => {
    const doc = win.document;
    const existing = doc.getElementById(mountId);
    if (existing) {
      existing.remove();
    }
    const $ele = doc.createElement('div');
    $ele.id = mountId;
    doc.body.appendChild($ele);
    // @ts-expect-error - VirtualSelect attached to window by the bundle
    win.VirtualSelect.init({ ele: $ele, options: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }] });
    return $ele;
  };

  // Destroy every tracked instance so we reach a deterministic zero-instance state,
  // regardless of how many dropdowns the demo page mounted on load.
  const destroyAll = (win: Window) => {
    // @ts-expect-error - activeInstances is a static Set on the bundle
    const instances = Array.from(win.VirtualSelect.activeInstances as Set<{ destroy: () => void }>);
    instances.forEach((instance) => instance.destroy());
  };

  it('tears down the observer and page listeners once the last instance is destroyed', () => {
    cy.visit('get-started');
    cy.window().then((win) => {
      const VS = (win as unknown as { VirtualSelect: any }).VirtualSelect;

      // Detaching the resize handler must use the exact same reference that was attached,
      // otherwise removeEventListener is a silent no-op. Assert that explicitly.
      const removeSpy: any = cy.spy(win as any, 'removeEventListener').as('winRemove');

      destroyAll(win);

      expect(VS.activeInstances.size, 'no instances remain').to.eq(0);
      expect(VS.hasGlobalListeners, 'global-listeners flag cleared').to.eq(false);
      expect(VS.domObserver, 'shared observer disconnected and nulled').to.eq(null);
      expect(
        removeSpy.calledWith('resize', VS.onResizeThrottled),
        'resize listener removed with the same stable reference',
      ).to.eq(true);
    });
  });

  it('re-establishes the observer and listeners when a new instance is created', () => {
    cy.visit('get-started');
    cy.window().then((win) => {
      const VS = (win as unknown as { VirtualSelect: any }).VirtualSelect;

      destroyAll(win);
      expect(VS.domObserver, 'observer gone after teardown').to.eq(null);
      expect(VS.hasGlobalListeners, 'listeners gone after teardown').to.eq(false);

      mount(win);

      expect(VS.activeInstances.size, 'new instance tracked').to.be.greaterThan(0);
      expect(VS.hasGlobalListeners, 'listeners re-attached').to.eq(true);
      expect(VS.domObserver, 'observer recreated').to.not.eq(null);
    });
  });

  it('does not duplicate the observer when additional instances are added', () => {
    cy.visit('get-started');
    cy.window().then((win) => {
      const VS = (win as unknown as { VirtualSelect: any }).VirtualSelect;

      destroyAll(win);
      mount(win);
      const firstObserver = VS.domObserver;
      expect(firstObserver, 'observer created by first instance').to.not.eq(null);

      // a second instance reuses the same shared observer
      const doc = win.document;
      const $second = doc.createElement('div');
      $second.id = 'vs-lifecycle-2';
      doc.body.appendChild($second);
      VS.init({ ele: $second, options: [{ label: 'C', value: 'c' }] });

      expect(VS.domObserver, 'shared observer not recreated for the 2nd instance').to.eq(firstObserver);
    });
  });

  it('cancel() prevents a queued trailing resize call from firing', () => {
    cy.visit('get-started');
    // Non-zero base time: cy.clock() starts the fake clock at epoch (0). With the throttle's
    // previous=0 after cancel(), now-previous would equal 0 and the leading edge would not
    // fire (it would schedule a trailing call instead). A real-world timestamp keeps
    // now-previous > wait so the leading edge fires synchronously, as it does in production.
    cy.clock(1_000_000);
    cy.window().then((win) => {
      const VS = (win as unknown as { VirtualSelect: any }).VirtualSelect;

      // Keep one live instance so onResizeMethod has a wrapper to act on, and stub the
      // per-instance recompute so we can count invocations without doing real layout work.
      destroyAll(win);
      const $ele = mount(win);
      const instance = $ele.virtualSelect;
      const onResize = cy.stub(instance, 'onResize').as('onResize');

      // Reset throttle state so timing is deterministic under the synthetic clock.
      VS.onResizeThrottled.cancel();

      VS.onResizeThrottled(); // leading edge -> fires synchronously
      VS.onResizeThrottled(); // within the window -> schedules a trailing call (~100ms)

      cy.then(() => {
        expect(onResize.callCount, 'only the leading call has fired so far').to.eq(1);
        VS.onResizeThrottled.cancel(); // clears the pending trailing timer
      });

      cy.tick(250); // advance past the throttle window
      cy.then(() => {
        expect(onResize.callCount, 'trailing call was cancelled, count unchanged').to.eq(1);
      });
    });
  });

  it('control: without cancel(), the trailing resize call does fire (test is meaningful)', () => {
    cy.visit('get-started');
    // Non-zero base time: cy.clock() starts the fake clock at epoch (0). With the throttle's
    // previous=0 after cancel(), now-previous would equal 0 and the leading edge would not
    // fire (it would schedule a trailing call instead). A real-world timestamp keeps
    // now-previous > wait so the leading edge fires synchronously, as it does in production.
    cy.clock(1_000_000);
    cy.window().then((win) => {
      const VS = (win as unknown as { VirtualSelect: any }).VirtualSelect;

      destroyAll(win);
      const $ele = mount(win);
      const instance = $ele.virtualSelect;
      const onResize = cy.stub(instance, 'onResize').as('onResize');

      VS.onResizeThrottled.cancel();
      VS.onResizeThrottled(); // leading
      VS.onResizeThrottled(); // schedules trailing

      cy.tick(250); // no cancel() this time
      cy.then(() => {
        expect(onResize.callCount, 'leading + trailing both fired').to.eq(2);
      });
    });
  });
});
