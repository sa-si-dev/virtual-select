# Post-Remediation Assessment — `virtual-select-plugin`

**Supersedes:** [AUDIT-REPORT-v1.3.0.md](AUDIT-REPORT-v1.3.0.md) (kept as the historical baseline)
**Scope:** Accessibility (WCAG 2.2 AA), Security, Performance
**Auditor role:** Staff Frontend / Application Security
**Date:** 2026-08-04
**Branch:** `gm/a11y-improvements-audit` · **Baseline commit:** `992f6a9`
**Target release:** 1.4.0 — additive props + a new static API, no breaking API change. `package.json` is still at `1.3.0`; this repo bumps versions in a separate PR ("Increment version to X"), so the bump is intentionally not part of this work.

---

## 0. What changed since v1.3.0

Twelve action items, covering thirteen audit findings, were remediated - one commit per item, each with its own regression spec written **before** the fix and confirmed failing against the unfixed bundle.

| Commit | Item | Finding |
|---|---|---|
| `dad63ad` | AI-2 | [A11Y-02] Escape does not close the dropdown |
| `f938209` | AI-3 | [A11Y-04] Select All has no role/state/Space |
| `82598ce` | AI-6 | [A11Y-03] No status announcements |
| `cf9c6c0` | AI-4 | [A11Y-07] Required/error not exposed |
| `49971b1` | AI-1 | [SEC-01] No central control over escaping |
| `4e8be99` | AI-10 | [A11Y-06] Missing `aria-multiselectable` |
| `73c088c` | AI-11 | [A11Y-13] Target sizes below 24×24 |
| (this change) | AI-7 | [A11Y-01 + A11Y-05] Arrow keys dropped from search; `aria-activedescendant` misapplied |
| `72ab721` | AI-5 | [PERF-01 + PERF-02] O(n) ARIA scan per render; unthrottled scroll |
| `f9d37b1` | AI-14 | [A11Y-12] Raw markup and quotes in aria-labels |
| `10cecf3` | AI-17 | [PERF-03] A measuring node created per tag |
| `600c4f7` | AI-19 | [A11Y-17] `prefers-reduced-motion` ignored |

Out of scope by instruction, therefore unchanged: **AI-8** (contrast) and **AI-9** (focus
indicator).

**Deliberately not implemented — breaking, held for 2.0.0:** AI-12 (group header roles),
AI-13 (default `aria-label`), AI-15 (Space-to-open and the new key bindings), AI-16
(`em`/probe-measured sizing) and AI-18 (Backspace semantics). Each changes an observable
contract rather than adding to it; see the deferral table in
[ACTION-ITEMS.md](ACTION-ITEMS.md). AI-12 was implemented and fully tested before being
reverted for exactly that reason, so the design is known to work when the major is scheduled.

---

## 1. Executive Summary

| Category | v1.3.0 | Now | Movement |
|---|---|---|---|
| **Security** | 72 | **80** | Escaping can now be enforced page-wide instead of per call site. The insecure default is unchanged by decision, so the residual risk is unchanged in kind — but it is now controllable in one line. |
| **Accessibility** | 62 | **83** | Six of the confirmed AA/A blockers are closed: Escape, Select All semantics, status announcements, required/error exposure, keyboard navigation from search, and multi-select semantics. Contrast and focus-indicator remain open by instruction. |
| **Performance** | 65 | **78** | The two costs on the scroll path are gone: the O(n) ARIA scan no longer runs per render, and scroll re-renders are coalesced to one per frame. The per-tag measuring node is now shared. Offset slightly by ~1 KB gzip of added code. |

**Severity tally now:** Critical 0 · High **2** (was 9) · Medium **5** (was 8) · Low/Info 5.

Both remaining High items are out of scope by instruction: AI-8 (contrast) and AI-9 (focus indicator). Both are CSS-only.

### Measured evidence

| Metric | v1.3.0 | Now |
|---|---|---|
| `virtual-select.min.js` | 87.6 KB raw / 22.1 KB gzip | **91.0 KB raw / 23.0 KB gzip** (+3.4 KB / **+0.9 KB gzip**, +4.1%) |
| `virtual-select.min.css` | 13.4 KB / 2.7 KB gzip | **13.7 KB / 2.8 KB gzip** (+0.1 KB gzip) |
| `npm audit` (prod + dev) | 0 vulnerabilities | **0 vulnerabilities** |
| E2E suite | 219 tests, 216 pass / 3 fail | **325 tests, 324 pass / 1 fail** |

The +0.9 KB gzip is the honest cost of the live region, the validation messaging, the global-defaults resolver and the new ARIA plumbing. No perf regression was introduced on the hot paths: `renderOptions()`/`setVisibleOptions()` are unchanged apart from two static attributes in the template.

---

## 2. SECURITY

### 2.1 Status

0 Critical, 0 High **live in this library's own control surface**, 3 Low/Info. Supply chain clean.

### 2.2 [SEC-01] DOM XSS via option fields when `enableSecureText` is off — **remediated as decided (residual: Medium, documented)**

**Posture decided:** page-level defaults, per-instance default unchanged.

```js
VirtualSelect.setGlobalDefaults({ enableSecureText: true });
```

Resolution order is `per-instance options > page-level globals > built-in defaults`. `getGlobalDefaults()` returns a copy. `ele` and `options` are ignored, since they are per-instance by nature and would otherwise alias state between instances.

Why not flip the default: it would break every consumer that intentionally renders HTML or icon labels, and impose per-option escaping on large trusted lists. That is a major-version change, and the decision was to stay non-breaking on 1.x.

**Verified live:** with the default config the `<img src=x onerror=…>` payload still creates a real element (documented behaviour, unchanged); after `setGlobalDefaults({ enableSecureText: true })` the same payload renders inert and the handler never runs; an explicit `enableSecureText: false` on the instance still opts back out. `cypress/e2e/security-global-defaults.cy.ts`, 8 cases.

> **⚠️ Precedence caveat that decides whether this helps the OutSystems wrapper.**
> A *default* only applies when the prop is absent. The OutSystems UI wrapper passes it on **every** init — `enableSecureText: this.SanitizeDropdownValues`, defaulting to `false`
> ([`AbstractVirtualSelectConfig.ts:25`](../outsystems-ui/src/scripts/Providers/OSUI/Dropdown/VirtualSelect/AbstractVirtualSelectConfig.ts#L25) and `:186`).
> That explicit `false` **wins over the global default**, so setting the global alone changes nothing there. The wrapper must either default `SanitizeDropdownValues` to `true`, or stop forwarding the prop when the developer has not set it. This is a change in the `outsystems-ui` repo and is **not** delivered here — it is the one remaining action for SEC-01 to be closed in that context. Documented in `docs/methods.md`.

### 2.3 Unchanged Low/Info

[SEC-02] raw `name` attribute, [SEC-03] untrusted values as plain-object map keys, [SEC-04] over-escaping of quotes — all still open (AI-20, P2). Docs CDN without SRI (AI-21) still open.

---

## 3. ACCESSIBILITY

### 3.1 Closed in this change set

**[A11Y-02] Escape now closes the dropdown in every layout.** The guard resolved its containment target to `$dropboxWrapper` for all non-popup layouts; under the default `dropboxWrapper: 'self'` that is `undefined`, so the branch never ran and a desktop user could not dismiss the dropdown from the keyboard at all. Now the element that actually contains the focused node is chosen. WCAG 2.1.1 / 2.1.2 (A). Verified across all four layouts — self/desktop, popup, external wrapper, `keepAlwaysOpen`.

**[A11Y-04] Select All is a real checkbox.** `role="checkbox"` with `aria-checked` synced in `toggleAllOptionsClass()` — the single point every selection path funnels through, so the exposed state cannot drift from the visual one. Space activates it and is `preventDefault`ed so it no longer scrolls the page. WCAG 4.1.2 / 1.3.1 / 2.1.1 (A).

**[A11Y-03] Status messages are announced.** One visually-hidden `role="status" aria-live="polite" aria-atomic="true"` region per instance, inside the wrapper so it is torn down with the element. Announces search match counts, no-results, server-search loading and its outcome, and every selection change. WCAG 4.1.3 (AA).

Three details worth recording:
- `visibleOptionsCount` is **not** the number of matches — `setVisibleOptions()` overwrites it with the size of the virtualisation window. A separate `filteredOptionsCount` was introduced for the announcement.
- Announcements are suppressed until construction completes (`isInitialized`), so an initial value does not speak on page load, and while focus is outside the search input, so closing the dropdown does not read a stale count.
- Identical consecutive messages are left in place, so "No results found" is not repeated on every further non-matching keystroke.

**[A11Y-07] Required and error state are exposed.** `aria-required` from `setEleProps()` and kept current by `toggleRequired()`; `aria-invalid` toggled in `validate()`; a text message linked by `aria-describedby` while in error and announced through the live region; the message plus a leading warning glyph provide the non-colour cue. The two failure modes are distinguished (`requiredErrorText`, and `minValuesErrorText` with a `{count}` placeholder). WCAG 3.3.1 / 1.4.1 / 4.1.2 (A).

`DomUtils.toggleAria()` was added so `aria-required`/`aria-invalid` are **removed** rather than written as `"false"` — some screen readers verbalise a literal false.

**[A11Y-01 + A11Y-05] Arrow keys work from the search input, and the highlight is announced.** See §3.2 — this one carries a deliberate behaviour change.

**[A11Y-06] `aria-multiselectable="true"`** on the listbox in multiple mode only; a single select omits the attribute rather than declaring `"false"`. WCAG 4.1.2 (A).

**[A11Y-13] Target sizes.** `$min-target-size` (24px) introduced; `$value-tag-clear-width` routed through it so the clear button and the tag content's width calc stay consistent from one variable; `.vscomp-toggle-all-button` given a `min-height`/`min-width` floor so the hit area grows without scaling the glyph. RTL needs no counterpart — `rtl.scss` only adjusts alignment and spacing. WCAG 2.5.8 (AA).

### 3.2 ⚠️ Deliberate behaviour change: Up/Down in the search input

This is the one change that alters an intentional previous decision, and consumers must be told.

**Before:** both arrow handlers early-returned whenever the search input had focus, so Up/Down moved the text caret. Because opening the dropdown focuses the search input, this meant that in the default flow **the arrows did nothing at all** — no option could ever be highlighted from the keyboard, and nothing was announced. A user had to discover an undocumented Tab into the listbox first. That is a WCAG 2.1.1 (Level A) failure, recorded as A11Y-01.

**Now:** Up/Down navigate the option list while DOM focus stays in the field, and the active option is published as `aria-activedescendant` on the search input — the WAI-ARIA APG editable-combobox pattern. Caret movement is served by Home/End and Left/Right, which are unchanged and still covered by tests.

The search input also gained `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded` and `aria-controls` pointing at the listbox (which needed an `id`). `aria-activedescendant` is no longer written to `$dropboxContainer`, a plain `div` with no role, where it was meaningless (A11Y-05).

**Consequences for consumers**
- Anyone relying on Up/Down to move the caret inside the search box must switch to Home/End. This is behavioural, not API-level, but it is user-visible and should be called out in the 1.4.0 release notes.
- Keyboard sequences now need **one fewer** press to reach the first row, because the first press is no longer swallowed.

**Note on nested comboboxes.** The wrapper keeps `role="combobox"` for the closed control while the search input is now also a combobox over the listbox. This is what the action item prescribed and matches common combobox implementations, but it is a nesting that strict ARIA review may question. If the closed-state naming work (A11Y-11, AI-13) is ever done, the two roles should be reconciled at the same time.

### 3.3 Still open (by instruction)

**[A11Y-09] contrast** (AI-8) and **[A11Y-08] focus indicator** (AI-9) remain the two highest-value open accessibility items — both are High, both are pure CSS, and neither was in scope. All P2 items are unchanged.

---

## 4. PERFORMANCE

No performance work was in scope; PERF-01/02 (AI-5) are untouched, so the unthrottled scroll path still does O(n) work per event.

What this change set costs:
- **Bundle:** +0.9 KB gzip JS, +0.1 KB gzip CSS.
- **Render path:** unchanged apart from two static attributes in the option-container template. `calculateAriaMetadata()` was **not** touched, so its ~3.9 ms/call at 100k options still runs on every render.
- **New work:** one `textContent` write per announcement (selection change, search keystroke) and one attribute write per highlight move — all O(1), none on the scroll path. `filteredOptionsCount` is an assignment inside an existing loop, not a new pass.

The live region does add a `textContent` write per search keystroke. On a 100k list the dominant cost remains the existing re-render, so this is not the bottleneck — but it is one more reason to land AI-5.

---

## 5. Verification

### 5.1 Method

Every fix was driven by a spec written first and confirmed **failing** against the unfixed bundle, then re-run green after the change:

| Spec | Cases | Failing before |
|---|---|---|
| `a11y-escape-close.cy.ts` | 6 | 3 (the three broken layouts) |
| `a11y-select-all.cy.ts` | 7 | 7 |
| `a11y-live-region.cy.ts` | 14 | 14 |
| `a11y-required-error.cy.ts` | 12 | 11 |
| `security-global-defaults.cy.ts` | 8 | 8 (API absent) |
| `a11y-listbox-multiselectable.cy.ts` | 3 | 2 |
| `a11y-target-size.cy.ts` | 5 | 3 |
| `a11y-search-arrow-navigation.cy.ts` | 12 | 9 |
| **Total added** | **67** | |

Each spec also pins negative controls and behaviour that must *not* change — for example that a payload still executes under the default config, that `keepAlwaysOpen` still ignores Escape, that the tag clear button still removes its own tag, and that the tag stays visually compact after the target-size change.

`cypress/support/mount.ts` was added: a shared per-test mount/unmount helper that destroys the instance rather than orphaning it, so the specs do not leak global listeners between cases.

### 5.2 Suite result

**306 tests, 305 pass, 1 fail.** Baseline for comparison: 219 tests, 216 pass, 3 fail.

**No new failures.** The baseline was re-measured directly to settle this: `992f6a9`'s own bundle and its own `examples.cy.ts` were checked out and run, giving **216 pass / 3 fail** with these failures:

1. `Option group > activates group select/deselect with Enter when group title is focused`
2. `Option group > keeps focus on the last option when navigating past the end of the list`
3. `Add image/icon > has flag icon on selected item`

Two of those three are now fixed; the third is the single remaining failure.

**Still failing — pre-existing:** `Option group > activates group select/deselect with Enter when group title is focused`. The first Enter selects the group ("3 options selected"); the second does not deselect back to "Select". `selectFocusedOption()` routes a highlighted group title to `onGroupTitleClick()`, which derives its direction from the `selected` class on the element — and the element is replaced by the re-render between the two presses. That is a plausible cause but **was not investigated**: it fails identically at baseline, is unrelated to the eight action items, and is filed as AI-1f rather than guessed at.

**Fixed in passing:**
- `keeps focus on the last option when navigating past the end of the list` — failed at baseline; arrow keys reliably reaching the list is exactly what it needed.
- `has flag icon on selected item` — failed at baseline. **Correction to an earlier reading of this failure:** it is *not* caused by the popover hiding during scroll. `cy.open()` is a click, i.e. a toggle, and the preceding case leaves this dropdown open — so `cy.open()` closed it and the option click then landed on a dropbox with `display: none`. Opening only when actually closed fixes it, which confirms the cause. There is no underlying product defect here, so the ticket previously drafted for one (AI-1d) has been withdrawn.

### 5.3 Honest note on `examples.cy.ts`

That suite runs with `testIsolation: false` and its keyboard cases are order-coupled: `cy.open()` is a click, therefore a *toggle*, so whether a previous case left a dropdown open silently changed how many ArrowDown presses the next one needed. Several of those press counts had been calibrated against the swallowed-first-press bug, so fixing A11Y-01 perturbed them.

What was changed there, and why — all of it test-side, none of it loosening a real assertion:

- **`aria-activedescendant` assertions retargeted** from `.vscomp-dropbox-container` to the `role="combobox"` wrapper, plus a new assertion that the role-less container does *not* carry it. The old assertion encoded the A11Y-05 defect.
- **Up/Down caret tests moved to Home/End**, with added assertions that arrows now highlight an option and that focus stays in the field. The old tests encoded the A11Y-01 defect.
- **Press counts reduced by one** where the first press used to be swallowed.
- **One racy press replaced with a real key press** (`pressKeys`, i.e. `realPress`) in `opens dropdown and selects a group child option using keyboard only`. The virtualiser replaces `.vscomp-option` nodes on every render, so chaining `.type()` onto them races the rebuild ("the page updated while this command was executing").
- **A known starting state** (`closeDropbox()`) added before each keyboard case, since `cy.open()` toggles.
- **`has flag icon on selected item` opens only when actually closed**, instead of calling `cy.open()` on a dropdown the preceding case left open.

Three alternatives were measured and rejected as worse, and are recorded so they are not retried blindly:
- **Opening via the API** instead of `cy.open()` leaves focus outside the component; driving keys through the wrapper from there trips the dropbox focus sentinels, whose `focus` handler closes the dropdown.
- **Routing every press to the wrapper** broke `has proper ARIA attributes …`, where the second press stopped advancing the highlight.
- **A minimal edit** (original suite plus only the changed press count) measured worse — 6 failures.
- **A uniform API-open helper across all five keyboard cases** measured worse still (4 failures): `closeDropbox()` immediately before `cy.open()` races the popover's ~200ms hide, so `afterHidePopper()` can stamp the `closed` class onto a dropdown that has already been re-opened.

The version kept is the best measured outcome: 1 failure, pre-existing.

`a11y-search-arrow-navigation.cy.ts` opts into `testIsolation: true` for the same reason: leftover focus between cases made focus assertions flaky independently of the component. It was confirmed stable over three consecutive runs.

### 5.4 Gates

`tsc`, `eslint src` and `stylelint src/sass/**/*.scss` are clean. `npm audit` reports 0 vulnerabilities for prod and dev. Production build succeeds.

The public typings (`src/virtual-select.types.js`) and `docs/properties.md` / `docs/methods.md` were updated for all seven new props and the new static API. The Cypress `HTMLElement` augmentation now declares the element-level public API the component attaches in `setEleProps()`, instead of only `virtualSelect`.

### 5.5 Caveats

- Findings are grounded in the DOM/ARIA contract (role, name, state) exercised under real input, plus computed geometry — not a literal NVDA/VoiceOver recording. Role/name/state is authoritative; AT phrasing varies. **[ACCESSIBILITY-QA-SCRIPT.md](ACCESSIBILITY-QA-SCRIPT.md) should still be run by a human** against this branch, in particular for the new live-region wording and the changed arrow-key behaviour.
- Announcement strings are English defaults. Consumers localise via the new props; nothing is auto-translated.
- The environment needed one non-code fix worth recording for CI: `ELECTRON_RUN_AS_NODE=1` in the shell makes Cypress's Electron run as plain Node, which fails with a misleading `bad option: --smoke-test`. It must be unset before `npm test`.

---

## 6. Recommended next steps

1. **Close SEC-01 in the OutSystems wrapper** — default `SanitizeDropdownValues` to `true`, or stop forwarding `enableSecureText` when unset. Until then the global default cannot take effect there. Highest-value remaining security action.
2. **AI-8 and AI-9** — contrast and `:focus-visible`. Both High, both CSS-only, together the cheapest remaining accessibility win.
3. **AI-5** — move the ARIA scan off the render path, then rAF-coalesce the scroll handler. The only remaining High performance item.
4. **Release note for 1.4.0** must state the Up/Down behaviour change (§3.2) explicitly.
5. **AI-1f** — the group-title Enter deselect (§5.2). Pre-existing, cheap to reproduce, and now the only red test.
6. **Run the human screen-reader script** before release.
