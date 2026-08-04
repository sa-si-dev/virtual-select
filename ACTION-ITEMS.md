# Virtual Select — Prioritized Action Items

Backlog derived from the audit ([AUDIT-REPORT-v1.3.0.md](AUDIT-REPORT-v1.3.0.md)), with remediation status from the post-fix assessment ([AUDIT-REPORT-v1.4.0.md](AUDIT-REPORT-v1.4.0.md)).
Each open item is ticket-ready: **priority · severity · standard · steps to reproduce · fix**.
Order: **Done** → **P1** (near-term) → **P2** (structural/next major).

Status legend: ✅ **DONE** (fixed + regression test) · ⬜ open · ✅ verified live · 🔎 code-verified · ⚠️ did-not-reproduce (do not action without re-confirmation).

**Branch:** `gm/a11y-improvements-audit` · **Baseline:** `992f6a9` · **Target release:** 1.4.0

---

## ✅ Completed

Each item below was fixed in its own commit, with a regression spec written first and confirmed failing against the unfixed bundle. 97 tests added; the suite went from 219 tests with 3 failures to **336 tests with none**.

| ID | Item | Commit | Spec | Standard |
|---|---|---|---|---|
| **AI-2** | [A11Y-02] Escape now closes the dropdown in every layout | `dad63ad` | `a11y-escape-close.cy.ts` (6) | 2.1.1 / 2.1.2 (A) |
| **AI-3** | [A11Y-04] Select All is a `role="checkbox"` with `aria-checked`, activated by Space | `f938209` | `a11y-select-all.cy.ts` (7) | 4.1.2 / 1.3.1 / 2.1.1 (A) |
| **AI-6** | [A11Y-03] Per-instance `role="status"` live region; announces counts, no-results, loading, selection | `82598ce` | `a11y-live-region.cy.ts` (14) | 4.1.3 (AA) |
| **AI-4** | [A11Y-07] `aria-required` / `aria-invalid` + announced error message + non-colour cue | `cf9c6c0` | `a11y-required-error.cy.ts` (12) | 3.3.1 / 1.4.1 / 4.1.2 (A) |
| **AI-1** | [SEC-01] `VirtualSelect.setGlobalDefaults()` so a host can enforce escaping page-wide | `49971b1` | `security-global-defaults.cy.ts` (8) | OWASP A03 |
| **AI-10** | [A11Y-06] `aria-multiselectable` on the listbox in multiple mode | `4e8be99` | `a11y-listbox-multiselectable.cy.ts` (3) | 4.1.2 (A) |
| **AI-11** | [A11Y-13] Select All and tag clear button raised to 24×24 | `73c088c` | `a11y-target-size.cy.ts` (5) | 2.5.8 (AA) |
| **AI-7** | [A11Y-01 + A11Y-05] Arrows navigate from the search input; `aria-activedescendant` on the focused combobox | (this change) | `a11y-search-arrow-navigation.cy.ts` (12) | 2.1.1 / 4.1.2 (A) |
| **AI-5** | [PERF-01 + PERF-02] ARIA scan off the render path; scroll re-renders coalesced per frame | `72ab721` | `perf-scroll-aria.cy.ts` (6) | INP |
| **AI-14** | [A11Y-12] Markup and quotes stripped from every aria-label | `f9d37b1` | `a11y-aria-label.cy.ts` (6) | 4.1.2 / 1.1.1 (A) |
| **AI-17** | [PERF-03] One shared text measurer instead of one node per tag | `10cecf3` | `perf-text-measurer.cy.ts` (4) | INP |
| **AI-19** | [A11Y-17] `prefers-reduced-motion` honoured in CSS and in the JS durations | `600c4f7` | `a11y-reduced-motion.cy.ts` (3) | 2.3.3 (AAA) |
| **AI-1f** | Closing the dropbox now drops the option highlight synchronously | (this change) | `a11y-close-clears-highlight.cy.ts` (5) | 2.1.1 / 4.1.2 (A) |
| **AI-1e** | `cy.openFresh()`: keyboard cases open from an asserted state instead of toggling | (this change) | `examples.cy.ts` (5 cases rewritten) | — |
| **AI-8** | [A11Y-09] Placeholder, glyphs and the active-option cue coloured explicitly | (this change) | `a11y-contrast.cy.ts` (6) | 1.4.3 / 1.4.11 (AA) |

### ⚠️ Follow-ups created by the completed work

#### AI-1b · SEC-01 is **not** closed for the OutSystems wrapper — **High** ✅
- **Where:** `outsystems-ui` repo, not this one.
- **Why:** `setGlobalDefaults()` sets a *default*, which only applies when the prop is absent. The wrapper passes `enableSecureText: this.SanitizeDropdownValues` on **every** init, defaulting to `false` ([`AbstractVirtualSelectConfig.ts:25`](../outsystems-ui/src/scripts/Providers/OSUI/Dropdown/VirtualSelect/AbstractVirtualSelectConfig.ts#L25), forwarded at `:186`). That explicit `false` wins, so setting the global changes nothing there.
- **Fix (in `outsystems-ui`):** default `SanitizeDropdownValues` to `true`, **or** stop forwarding `enableSecureText` when the developer has not set it.
- **Correction to the exposure statement.** "Option text is still rendered as raw HTML in every
  OutSystems dropdown" overstates it. `getProviderConfig()` already runs every
  `option.label` through `OSFramework.OSUI.Helper.Sanitize()` before the options reach the
  library, so labels are covered — though by *substitution*, not escaping: `Sanitize` rewrites
  `<`/`>` to the look-alike characters `‹`/`›`, so a legitimate label containing angle brackets is
  silently altered, and quotes are left untouched.
- **What is genuinely uncovered** is everything `Sanitize` is not applied to and `secureText` then
  skips because `enableSecureText` is `false`:
  - `option.description` — stored raw by `setOptions()` and interpolated into
    `<div class="vscomp-option-description">${d.description}</div>`, i.e. an HTML sink.
  - `option.customData.group_name` / `.description` — `setOptions()` copies `customData` verbatim
    (`option.customData = d.customData`), and the wrapper populates it from `group_name` /
    `description` in `_groupOptions()`. It reaches `aria-label`, where `getAriaLabelText()` now
    strips tags and escapes quotes (AI-14), so it is contained — but only there.
  So the ranking is: **`description` is the live sink**, `label` is altered-but-not-injectable, and
  `customData` is contained by AI-14. Fixing the default still closes all three properly.

#### AI-1c · Release note for the Up/Down behaviour change — **required for 1.4.0** ✅
- Up/Down in the search input now navigate the option list instead of moving the text caret (APG editable-combobox). Caret movement is Home/End and Left/Right.
- This reverses an intentional earlier decision, and it is user-visible. It must be stated in the 1.4.0 release notes. See §3.2 of the v1.4.0 assessment.

#### ~~AI-1d~~ · WITHDRAWN — was not a product defect ✅
- Originally drafted as "virtualised options are transiently unclickable while scrolling", from the long-standing `examples.cy.ts > Add image/icon > has flag icon on selected item` failure.
- **That reading was wrong.** The cause is `cy.open()` being a click, i.e. a toggle: the preceding case leaves the dropdown open, so `cy.open()` closed it and the option click then landed on a dropbox with `display: none`. Opening only when actually closed fixes the test, which confirms the cause.
- No product change needed. Folded into AI-1e as test debt.

#### AI-1f · ~~Enter on a group title selects but does not deselect~~ → **closing did not end option navigation** — **Medium** ✅ FIXED
- **The original description was wrong.** Enter on a group title *does* toggle both ways. A
  mounted grouped multi-select selects the group on the first Enter and clears it on the second,
  and that holds against the **unfixed** bundle (`a11y-close-clears-highlight.cy.ts >
  toggles a whole group on and off with Enter on its group title` passes pre-fix). The audit
  read the red test as "the second Enter does nothing"; the run log shows it actually failed on
  the **first** assertion — `Expected to find content: '3 options selected'` — i.e. the first
  Enter selected one option, not the group.
- **Actual root cause:** `closeDropbox()` is asynchronous for every default instance.
  `initDropboxPopover()` runs whenever `!keepAlwaysOpen && !showAsPopup`, so the close goes
  through `dropboxPopover.hide()` and `afterHidePopper()` — the only caller of
  `removeOptionFocus()` — does not run until the hide transition ends. Measured live: for
  ~150–200 ms after `closeDropbox()` returns, `isOpened()` is still `true`, the previous
  `.focused` option is still in the DOM and `focusedOptionIndex` still holds its index.
- **Why that produced the red test:** the preceding case leaves the group title (index 0)
  highlighted. `cy.open()` waits a fixed 200 ms — right on that boundary — then clicks. When the
  highlight survived, the case's single ArrowDown moved 0 → 1, so Enter landed on `Option 1-1`
  instead of the group title. Same mechanism as AI-1e, not a separate defect.
- **Fix:** clear the highlight synchronously in `closeDropbox()`, next to the existing
  `setActiveDescendant('')`, instead of waiting for the transition. `removeOptionFocus()` is a
  no-op when nothing is highlighted, so the `afterHidePopper()` call stays for the silent path.
- **Second, smaller fix it depends on:** `toggleOptionFocusedState()` moved DOM focus on *both*
  edges, so clearing a highlight focused the element it had just un-highlighted. Harmless during
  navigation (the next call immediately focuses the new option) but wrong on close, where it
  pulled focus into a dropbox that is being hidden and fought the wrapper refocus. It now moves
  focus only when taking the highlight; `a11y-close-clears-highlight.cy.ts` pins that Escape
  still returns focus to the combobox.
- **User-visible payoff, not just test hygiene:** closing and reopening quickly no longer resumes
  arrow navigation from the row the user can no longer see.

#### AI-1e · `examples.cy.ts` keyboard cases are order-coupled — **Low** (test debt) ✅ FIXED
- `testIsolation: false` plus `cy.open()` being a *click* (therefore a toggle) means whether a previous case left a dropdown open silently changes how many key presses the next one needs. Several press counts had been calibrated against the AI-7 bug.
- **Fix:** a new `cy.openFresh(id)` command replaces the six-line `reset()` + `closeDropbox()` +
  `cy.open()` preamble in all five Option-group keyboard cases. It *asserts* its way into the
  starting state rather than waiting a fixed time for it: clear the value, close, wait for the
  `closed` class, click, wait for it to be gone, then assert no option carries the highlight. All
  three inputs a press count can depend on — open/closed, value, highlight — are pinned before
  the first key press.
- Neither of the two approaches §5.3 rejected was retried: this is not `testIsolation: true`
  (which would break the `go to section` pattern every describe relies on) and not
  API-opening (which leaves focus outside the component and trips the dropbox focus sentinels).
- Side effect worth noting: `examples.cy.ts` dropped from ~13 min to ~2 min, because several
  cases had been reaching their assertions only after Cypress retry timeouts.

---

## P1 — Near-term (open)

### ✅ AI-5 (DONE) · [PERF-02 + PERF-01] Scroll path does O(n) work per event, unthrottled — **High** ✅
- **Standard:** INP / long tasks (16.7 ms frame budget).
- **Reproduce:**
  1. Init 100k options; open dropdown.
  2. `calculateAriaMetadata()` ≈ 3.9 ms/call; a full `setVisibleOptions()` re-render ≈ **9.5 ms unthrottled / ~44 ms @ 4× CPU**, run on **every** scroll tick (no throttle/rAF).
- **Fix (two parts):**
  - Move the ARIA scan off the render path — recompute `aria-setsize`/`filteredIndex` only when the filtered set changes (`setVisibleOptionsCount`/`afterSetSearchValue`), and have `renderOptions()` just read cached values. Note `filteredOptionsCount` (added for AI-6) is already computed at the right moment and may serve as the hook.
  - rAF-coalesce the scroll handler:
    ```js
    onOptionsScroll() {
      if (this._scrollRaf) return;
      this._scrollRaf = requestAnimationFrame(() => { this._scrollRaf = null; this.setVisibleOptions(true); });
    }
    ```
    Cancel `this._scrollRaf` in `destroy()`.
- **Done.** The scan is now guarded by a dirty flag set by everything that changes the filtered set, and scroll re-renders are coalesced to one per animation frame (cancelled in `destroy()`).

### ✅ AI-8 (DONE) · [A11Y-09] Placeholder/icon contrast below AA — **High** ✅
- **Standard:** WCAG 1.4.3 / 1.4.11 (AA).
- **Reproduce:** empty single-select → placeholder is `#333 @ opacity 0.5` = **2.85:1** (fails 4.5). Clear/arrow icons `#999` = **2.85:1** (fails 3:1). Focused-option bg `#ccc` = **1.61:1**.
- **Fix:** replace opacity-dimming with explicit colours — placeholder `#595959` (7:1) / min `#767676` (4.5:1); icons `#767676`; darken the `.focused` option cue to ≥3:1.
- **Done, with one deviation from the prescription.** Placeholder → `$placeholder-color: #595959`
  (7:1) instead of `opacity: 0.5`; clear and search-clear glyphs → `$icon-color: #767676` (4.5:1).
  The arrow needed nothing: it is `$arrow-color: #111`, not `#999` — the audit's "clear/arrow
  icons `#999`" holds for the clear glyphs only.
- **Deviation:** the `.focused` fill was *not* darkened to 3:1. It cannot be. With `$font-color`
  (#333) option text, a fill dark enough for 3:1 against the neighbouring row (L ≤ 0.30) is also
  dark enough to push the label under 4.5:1 (needs L ≥ 0.324) — the two windows do not overlap,
  so darkening the fill would have traded a 1.4.11 failure for a 1.4.3 one. The cue is instead a
  2px inset ring (`outline` + negative `outline-offset`) in `$font-color`: 12.6:1 against #fff and
  11.6:1 against `$selected-color`, with `$focus-color` kept as the secondary cue.
  `a11y-contrast.cy.ts` asserts both directions, so this cannot silently regress either way.
- **Visual change to expect:** the highlighted/hovered option row now carries a dark 2px inset
  ring in the default theme. See the note below for `outsystems-ui`, which needs one override
  to keep its current look.

### ⬜ AI-9 · [A11Y-08] No visible focus indicator on the combobox — **High** ✅
- **Standard:** WCAG 2.4.7 / 1.4.11 (AA).
- **Reproduce:** Tab to the closed combobox → computed `outline-style:none`, `box-shadow:none` — no indicator.
- **Fix:** [src/sass/partials/virtual-select.scss:31](src/sass/partials/virtual-select.scss#L31)
  ```scss
  &:focus-visible { outline: 2px solid var(--vscomp-primary, #0a66c2); outline-offset: 2px; }
  ```
- Note this became more visible in practice: after AI-7 keyboard users reach the control and navigate far more often, so the missing indicator is hit more.
- AI-8 has since added `$focus-ring-color` / `$focus-ring-width` for the active-option ring; reuse
  them here rather than introducing a second ring colour.

### ⬜ AI-8b · `outsystems-ui` must opt out of the new active-option ring — **Low** (follow-up to AI-8)
- **Where:** `outsystems-ui` repo, not this one.
- **Why:** OSUI already overrides everything else AI-8 touched — `:not(.has-value) .vscomp-value`
  gets `color: neutral-7; opacity: 1`, `.vscomp-search-clear` gets `color: neutral-7`, the clear
  glyphs get their own colour, `.vscomp-arrow` is `display: none`, and `.vscomp-option.focused`
  gets `background-color: neutral-2`. So those four changes are invisible there. The ring is not:
  `outline` is a property OSUI never sets on options, and its own accessible-features cue
  (`a11y-default-outline(true)`) is an **inset `box-shadow`**, so under `.has-accessible-features`
  the two would stack into a doubled ring.
- **Fix (one rule, in `Providers/OSUI/Dropdown/VirtualSelect/scss/_virtualselect.scss`):**
  ```scss
  // Option Item
  .vscomp-option {
    // The library rings the active row for WCAG 1.4.11; OSUI carries that cue with its own
    // design tokens (neutral-2 fill, plus a11y-default-outline under .has-accessible-features).
    &.focused {
      outline: none;
    }
  }
  ```
- Alternatively drop the override and keep the library ring as the OSUI cue too — that is a design
  call, not a correctness one. Either way it has to be decided when the vendored
  `_virtualselect_lib.scss` is refreshed to 1.4.0, because that file is a copy of this library's
  compiled CSS and will bring the `outline` rule with it.

---

## ⛔ Deferred: breaking changes, held for a major (2.0.0)

**Decision:** AI-12, AI-13, AI-15, AI-16 and AI-18 are **not implemented**. Each changes a
contract that consumers can already be relying on, and this branch is targeting a
non-breaking 1.4.0. They stay specified below so they can be picked up together.

Why they are grouped rather than shipped piecemeal: they all change *observable* behaviour
rather than adding to it, so releasing them one at a time would mean several releases each
carrying its own migration note. One major with a single migration guide is cheaper for
consumers to absorb.

| ID | What breaks | Who it affects |
|---|---|---|
| **AI-12** | Group headers stop matching `[role="option"]` and lose `aria-selected`; non-interactive headers leave the accessibility tree; `aria-setsize` values shrink | Anything selecting headers by role, and any test asserting set-size numbers |
| **AI-13** | Removing the default `aria-label="Options list"` changes the accessible name of **every** instance that does not set `ariaLabelledby`/`ariaLabelText` — from a (poor) name to none | Every unlabelled instance; audits may newly flag "missing accessible name", which is the honest result but is still a visible change |
| **AI-15** | Space on the closed combobox would open it instead of scrolling the page; new Home/End/PageUp/PageDown bindings | Anyone relying on Space to scroll, or with their own handlers for those keys. Note Home/End inside the **search input** must keep moving the caret — AI-7 depends on that |
| **AI-16** | `em`/`min-height` sizing and deriving `optionHeight` from a measured probe row changes the public `optionHeight` prop's meaning and the virtualiser's row maths | Anyone setting `optionHeight`, and any layout depending on exact row pixels |
| **AI-18** | Changing Backspace/Delete from "clear everything" to "remove the last tag" changes what a keypress destroys | Anyone relying on the current clear-all behaviour |

**Note on AI-18:** the *announcement* half of it may already be satisfied — `reset()` goes
through `setValue()`, which announces via the live region added in AI-6. Only the
"remove last tag instead of all" half is breaking. Worth verifying before scheduling: if
confirmed, AI-18 can be closed as done and the behaviour change dropped entirely.

**Also already breaking on this branch:** AI-7 changed Up/Down in the search input from
moving the caret to navigating the list. That shipped because it fixed a Level A failure,
but it means 1.4.0 is not purely additive either — see AI-1c.

---

## P2 — Structural / next major

### ⛔ AI-12 (DEFERRED - breaking, see above) · [A11Y-10] Group headers use `role="option"` and inflate `aria-setsize` — **Medium** ✅
- **Reproduce:** grouped multi-select → header announced as "…, Select All, option, 1 of 8"; setsize counts headers.
- **Fix:** non-interactive headers `role="presentation"` (drop `aria-selected`/setsize); interactive multi-select headers `role="checkbox" aria-checked="mixed|true|false"`; exclude headers from setsize.
- Pairs naturally with AI-3, which already established the `role="checkbox"` + synced `aria-checked` pattern for Select All — reuse it here.

### ⛔ AI-13 (DEFERRED - breaking, see above) · [A11Y-11] Generic default `aria-label="Options list"` — **Medium** ✅
- **Reproduce:** instance without `ariaLabelledby` announces "Options list"; closed value is a concatenated string.
- **Fix:** remove the default `aria-label` [src/virtual-select.js:1222](src/virtual-select.js#L1222); document `ariaLabelledby` as the labeling path.
- **Do this together with reconciling the nested combobox roles:** AI-7 gave the search input `role="combobox"` while the wrapper keeps it for the closed control. That nesting is deliberate and matches common implementations, but strict ARIA review may question it — settle both at once.

### ✅ AI-14 (DONE) · [A11Y-12] Group-option `aria-label` uses raw HTML label — **Medium** 🔎
- **Reproduce:** grouped option with `label:'<i class="flag"></i> France'` → `aria-label` contains tag soup / truncates at first `"`.
- **Fix:** [src/virtual-select.js:391-393](src/virtual-select.js#L391) strip HTML first: `Utils.getString(d.label).replace(/<[^>]+>/ig,'').trim()` + `replaceDoubleQuotesWithHTML`.

### ⛔ AI-15 (DEFERRED - breaking, see above) · [A11Y-14] Missing keys: Space-to-open, Home/End/PageUp-Down, typeahead — **Medium** 🔎
- **Reproduce:** focus closed combobox, press Space → page scrolls; large list has no Home/End; no typeahead when `search:false`.
- **Fix:** map `32:'onEnterPress'` on the wrapper (with `preventDefault`); implement Home/End/Page keys and first-char typeahead.
- **Partially addressed:** AI-3 already handles Space on the Select All checkbox (with `preventDefault`). Space-to-open on the wrapper is still missing. Note Home/End in the **search input** must keep moving the caret — AI-7 depends on that.

### ⛔ AI-16 (DEFERRED - breaking, see above) · [A11Y-15] Fixed-px heights clip text at 200% zoom — **Medium** 🔎
- **Reproduce:** Firefox text-only zoom 200% → value row (20px) and option rows (40px) clip.
- **Fix:** `em`/`min-height` sizing; derive `optionHeight` from a measured probe row so the virtualizer scales with zoom.
- Note the new `.vscomp-error-message` (AI-4) already uses relative sizing and should not regress here.

### ✅ AI-17 (DONE) · [PERF-03] `willTextOverflow()` forces layout per tag — **Medium** 🔎
- **Reproduce:** `showValueAsTags` with many selected → temp element append + 2× `getComputedStyle` per tag [src/utils/utils.js:197](src/utils/utils.js#L197).
- **Fix:** cache a single measuring element + resolved font per render; or use `scrollWidth > clientWidth` on the real node.

### ⛔ AI-18 (DEFERRED - breaking, see above) · [A11Y-16] Backspace/Delete silently clears all selections — **Low** 🔎
- **Reproduce:** focus closed combobox with a value, press Backspace → full reset, no announcement.
- **Fix:** announce via the live region; consider removing only the last tag in multi/tag mode.
- **Now cheap:** the live region exists (AI-6) and `getSelectionMessage()` already produces the right text — `reset()` goes through `setValue()`, so this may already announce. **Verify before implementing**; if it does, only the "remove last tag instead of all" part remains.

### ✅ AI-19 (DONE) · [A11Y-17] No `prefers-reduced-motion` handling — **Low** 🔎
- **Fix:** `@media (prefers-reduced-motion: reduce) { .vscomp-dropbox-container,.vscomp-dropbox { transition-duration:0s !important } }`; pass `showDuration:0` when it matches.

### ⬜ AI-20 · [SEC-02/03/04] Hardening: attribute `name`, map keys, escaping — **Low** 🔎
- **Fix:** drop the raw `name` attribute (the DOM property is already set safely); use `Object.create(null)`/`Map` for value-keyed lookups; single canonical escape pass to avoid `&amp;quot;` over-escaping.

### ⬜ AI-21 · [Docs] Third-party CDN scripts without SRI — **Low** 🔎 (docs only, not shipped)
- **Fix:** add SRI hashes / pin versions in `docs/index.html` (font-awesome 3.2.1, Google Fonts, GA/GTM).

---

## Summary matrix

| ID | Item | Priority | Sev | Standard | Status |
|---|---|---|---|---|---|
| AI-1 | Central control over escaping | P0 | High | OWASP A03 | ✅ done |
| AI-2 | Escape doesn't close (desktop) | P0 | High | 2.1.1/2.1.2 | ✅ done |
| AI-3 | Select All no role/state/Space | P0 | High | 4.1.2 | ✅ done |
| AI-4 | Required/error not exposed | P0 | High | 3.3.1 | ✅ done |
| AI-6 | No status announcements | P1 | High | 4.1.3 | ✅ done |
| AI-7 | Arrow keys dropped from search | P1 | High | 2.1.1/4.1.2 | ✅ done |
| AI-10 | Missing aria-multiselectable | P1 | Med | 4.1.2 | ✅ done |
| AI-11 | Target sizes < 24px | P1 | Med | 2.5.8 | ✅ done |
| AI-1b | SEC-01 open in OSUI wrapper | P0 | High | OWASP A03 | ⬜ **other repo** |
| AI-1c | Release note: Up/Down change | P1 | — | — | ⬜ open |
| ~~AI-1d~~ | Withdrawn — mis-diagnosed, no product defect | — | — | — | ✅ n/a |
| AI-1f | Close left a stale option highlight (was mis-filed as "Enter does not deselect") | P2 | Med | 2.1.1/4.1.2 | ✅ done |
| AI-1e | examples.cy.ts order coupling | P2 | Low | — | ✅ done |
| AI-5 | Scroll O(n)/unthrottled | P1 | High | INP | ✅ done |
| AI-8 | Placeholder/icon contrast | P1 | High | 1.4.3/1.4.11 | ✅ done |
| AI-8b | OSUI opt-out for the new active-option ring | P2 | Low | — | ⬜ **other repo** |
| AI-9 | No focus indicator | P1 | High | 2.4.7 | ⬜ open |
| AI-12 | Group headers role=option | 2.0.0 | Med | 1.3.1/4.1.2 | ⛔ deferred (breaking) |
| AI-13 | Generic default label | 2.0.0 | Med | 2.4.6 | ⛔ deferred (breaking) |
| AI-14 | Group aria-label raw HTML | P2 | Med | 4.1.2 | ✅ done (`f9d37b1`) |
| AI-15 | Missing keys | 2.0.0 | Med | 2.1.1 | ⛔ deferred (breaking) |
| AI-16 | Fixed-px heights / zoom | 2.0.0 | Med | 1.4.4/1.4.10 | ⛔ deferred (breaking) |
| AI-17 | willTextOverflow layout | P2 | Med | INP | ✅ done |
| AI-18 | Backspace wipes selection | 2.0.0 | Low | 4.1.3 | ⛔ deferred (breaking half); announce half likely already done |
| AI-19 | No reduced-motion | P2 | Low | 2.3.3(AAA) | ✅ done |
| AI-20 | Security hardening | P2 | Low | OWASP | ⬜ open |
| AI-21 | Docs CDN no SRI | P2 | Low | — | ⬜ open |

---

## Recommended order for the next pass

1. **AI-1b** — the only reason SEC-01 is still live for OutSystems consumers. One line, another repo.
2. **AI-9** — the last remaining High accessibility item, CSS-only; reuse AI-8's `$focus-ring-*`.
3. **AI-1c** — release note, required before shipping 1.4.0. Add the AI-8 ring to it: the default
   theme's active-option row looks different now.
4. **AI-8b** — one override in `outsystems-ui`, to be settled when the vendored CSS is refreshed.
5. **AI-18 verification** — may already be complete; cheap to confirm.
6. Run **[ACCESSIBILITY-QA-SCRIPT.md](ACCESSIBILITY-QA-SCRIPT.md)** with a real screen reader against this branch, focusing on the new live-region wording and the changed arrow-key behaviour.

Suite state after this pass: **336 tests, 336 passing, 0 failing** (was 325 with 1 failure).
