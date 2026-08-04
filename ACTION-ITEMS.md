# Virtual Select — Prioritized Action Items

Backlog derived from the audit ([AUDIT-REPORT-v1.3.0.md](AUDIT-REPORT-v1.3.0.md)), with remediation status from the post-fix assessment ([AUDIT-REPORT-v1.4.0.md](AUDIT-REPORT-v1.4.0.md)).
Each open item is ticket-ready: **priority · severity · standard · steps to reproduce · fix**.
Order: **Done** → **P1** (near-term) → **P2** (structural/next major).

Status legend: ✅ **DONE** (fixed + regression test) · ⬜ open · ✅ verified live · 🔎 code-verified · ⚠️ did-not-reproduce (do not action without re-confirmation).

**Branch:** `gm/a11y-improvements-audit` · **Baseline:** `992f6a9` · **Target release:** 1.4.0

---

## ✅ Completed

Each item below was fixed in its own commit, with a regression spec written first and confirmed failing against the unfixed bundle. 67 tests added; suite went from 219 to 306 tests, and from 3 failures to 1 (all pre-existing).

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

### ⚠️ Follow-ups created by the completed work

#### AI-1b · SEC-01 is **not** closed for the OutSystems wrapper — **High** ✅
- **Where:** `outsystems-ui` repo, not this one.
- **Why:** `setGlobalDefaults()` sets a *default*, which only applies when the prop is absent. The wrapper passes `enableSecureText: this.SanitizeDropdownValues` on **every** init, defaulting to `false` ([`AbstractVirtualSelectConfig.ts:25`](../outsystems-ui/src/scripts/Providers/OSUI/Dropdown/VirtualSelect/AbstractVirtualSelectConfig.ts#L25), forwarded at `:186`). That explicit `false` wins, so setting the global changes nothing there.
- **Fix (in `outsystems-ui`):** default `SanitizeDropdownValues` to `true`, **or** stop forwarding `enableSecureText` when the developer has not set it.
- **Until then:** option text from untrusted input is still rendered as raw HTML in every OutSystems dropdown.

#### AI-1c · Release note for the Up/Down behaviour change — **required for 1.4.0** ✅
- Up/Down in the search input now navigate the option list instead of moving the text caret (APG editable-combobox). Caret movement is Home/End and Left/Right.
- This reverses an intentional earlier decision, and it is user-visible. It must be stated in the 1.4.0 release notes. See §3.2 of the v1.4.0 assessment.

#### ~~AI-1d~~ · WITHDRAWN — was not a product defect ✅
- Originally drafted as "virtualised options are transiently unclickable while scrolling", from the long-standing `examples.cy.ts > Add image/icon > has flag icon on selected item` failure.
- **That reading was wrong.** The cause is `cy.open()` being a click, i.e. a toggle: the preceding case leaves the dropdown open, so `cy.open()` closed it and the option click then landed on a dropbox with `display: none`. Opening only when actually closed fixes the test, which confirms the cause.
- No product change needed. Folded into AI-1e as test debt.

#### AI-1f · Enter on a group title selects but does not deselect — **Medium** ✅ (pre-existing)
- **Reproduce:** grouped multi-select, highlight a group title, press Enter → "3 options selected"; press Enter again → the value does **not** return to "Select".
- **Evidence:** `examples.cy.ts > Option group > activates group select/deselect with Enter when group title is focused` fails at baseline `992f6a9` (verified by running the baseline bundle against the baseline spec) and is the **only** remaining red test on this branch.
- **Lead, not a diagnosis:** `selectFocusedOption()` routes a highlighted group title to `onGroupTitleClick()`, which derives its direction from the `selected` class on the element — and the re-render between the two presses replaces that element. Worth checking first, but not investigated.
- Clicking the group title toggles correctly, so this is specific to the keyboard path.

#### AI-1e · `examples.cy.ts` keyboard cases are order-coupled — **Low** (test debt) ✅
- `testIsolation: false` plus `cy.open()` being a *click* (therefore a toggle) means whether a previous case left a dropdown open silently changes how many key presses the next one needs. Several press counts had been calibrated against the AI-7 bug.
- Partly mitigated: a known starting state per case, one racy press replaced with a real key press, and `has flag icon on selected item` now opens only when actually closed. The suite is down to 1 failure (AI-1f, pre-existing) — but the coupling itself remains. See §5.3 of the v1.4.0 assessment for four approaches already measured and rejected, so they are not retried blindly.
- **Fix:** move these cases to `testIsolation: true`, or make every keyboard case mount its own instance the way the new specs do via `cypress/support/mount.ts`.

---

## P1 — Near-term (open)

### ⬜ AI-5 · [PERF-02 + PERF-01] Scroll path does O(n) work per event, unthrottled — **High** ✅
- **Standard:** INP / long tasks (16.7 ms frame budget).
- **Reproduce:**
  1. Init 100k options; open dropdown.
  2. `calculateAriaMetadata()` ≈ 3.9 ms/call; a full `setVisibleOptions()` re-render ≈ **9.5 ms unthrottled / ~44 ms @ 4× CPU**, run on **every** scroll tick (no throttle/rAF).
- **Still fully open.** Untouched by the accessibility work; `calculateAriaMetadata()` was deliberately not modified.
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
- **Now the single highest-value open item**, and slightly more valuable than before: the live region adds one `textContent` write per search keystroke on top of the existing re-render.

### ⬜ AI-8 · [A11Y-09] Placeholder/icon contrast below AA — **High** ✅
- **Standard:** WCAG 1.4.3 / 1.4.11 (AA).
- **Reproduce:** empty single-select → placeholder is `#333 @ opacity 0.5` = **2.85:1** (fails 4.5). Clear/arrow icons `#999` = **2.85:1** (fails 3:1). Focused-option bg `#ccc` = **1.61:1**.
- **Fix:** replace opacity-dimming with explicit colours — placeholder `#595959` (7:1) / min `#767676` (4.5:1); icons `#767676`; darken the `.focused` option cue to ≥3:1.
- CSS-only. Together with AI-9 this is the cheapest remaining accessibility win.

### ⬜ AI-9 · [A11Y-08] No visible focus indicator on the combobox — **High** ✅
- **Standard:** WCAG 2.4.7 / 1.4.11 (AA).
- **Reproduce:** Tab to the closed combobox → computed `outline-style:none`, `box-shadow:none` — no indicator.
- **Fix:** [src/sass/partials/virtual-select.scss:31](src/sass/partials/virtual-select.scss#L31)
  ```scss
  &:focus-visible { outline: 2px solid var(--vscomp-primary, #0a66c2); outline-offset: 2px; }
  ```
- Note this became more visible in practice: after AI-7 keyboard users reach the control and navigate far more often, so the missing indicator is hit more.

---

## P2 — Structural / next major

### ⬜ AI-12 · [A11Y-10] Group headers use `role="option"` and inflate `aria-setsize` — **Medium** ✅
- **Reproduce:** grouped multi-select → header announced as "…, Select All, option, 1 of 8"; setsize counts headers.
- **Fix:** non-interactive headers `role="presentation"` (drop `aria-selected`/setsize); interactive multi-select headers `role="checkbox" aria-checked="mixed|true|false"`; exclude headers from setsize.
- Pairs naturally with AI-3, which already established the `role="checkbox"` + synced `aria-checked` pattern for Select All — reuse it here.

### ⬜ AI-13 · [A11Y-11] Generic default `aria-label="Options list"` — **Medium** ✅
- **Reproduce:** instance without `ariaLabelledby` announces "Options list"; closed value is a concatenated string.
- **Fix:** remove the default `aria-label` [src/virtual-select.js:1222](src/virtual-select.js#L1222); document `ariaLabelledby` as the labeling path.
- **Do this together with reconciling the nested combobox roles:** AI-7 gave the search input `role="combobox"` while the wrapper keeps it for the closed control. That nesting is deliberate and matches common implementations, but strict ARIA review may question it — settle both at once.

### ⬜ AI-14 · [A11Y-12] Group-option `aria-label` uses raw HTML label — **Medium** 🔎
- **Reproduce:** grouped option with `label:'<i class="flag"></i> France'` → `aria-label` contains tag soup / truncates at first `"`.
- **Fix:** [src/virtual-select.js:391-393](src/virtual-select.js#L391) strip HTML first: `Utils.getString(d.label).replace(/<[^>]+>/ig,'').trim()` + `replaceDoubleQuotesWithHTML`.

### ⬜ AI-15 · [A11Y-14] Missing keys: Space-to-open, Home/End/PageUp-Down, typeahead — **Medium** 🔎
- **Reproduce:** focus closed combobox, press Space → page scrolls; large list has no Home/End; no typeahead when `search:false`.
- **Fix:** map `32:'onEnterPress'` on the wrapper (with `preventDefault`); implement Home/End/Page keys and first-char typeahead.
- **Partially addressed:** AI-3 already handles Space on the Select All checkbox (with `preventDefault`). Space-to-open on the wrapper is still missing. Note Home/End in the **search input** must keep moving the caret — AI-7 depends on that.

### ⬜ AI-16 · [A11Y-15] Fixed-px heights clip text at 200% zoom — **Medium** 🔎
- **Reproduce:** Firefox text-only zoom 200% → value row (20px) and option rows (40px) clip.
- **Fix:** `em`/`min-height` sizing; derive `optionHeight` from a measured probe row so the virtualizer scales with zoom.
- Note the new `.vscomp-error-message` (AI-4) already uses relative sizing and should not regress here.

### ⬜ AI-17 · [PERF-03] `willTextOverflow()` forces layout per tag — **Medium** 🔎
- **Reproduce:** `showValueAsTags` with many selected → temp element append + 2× `getComputedStyle` per tag [src/utils/utils.js:197](src/utils/utils.js#L197).
- **Fix:** cache a single measuring element + resolved font per render; or use `scrollWidth > clientWidth` on the real node.

### ⬜ AI-18 · [A11Y-16] Backspace/Delete silently clears all selections — **Low** 🔎
- **Reproduce:** focus closed combobox with a value, press Backspace → full reset, no announcement.
- **Fix:** announce via the live region; consider removing only the last tag in multi/tag mode.
- **Now cheap:** the live region exists (AI-6) and `getSelectionMessage()` already produces the right text — `reset()` goes through `setValue()`, so this may already announce. **Verify before implementing**; if it does, only the "remove last tag instead of all" part remains.

### ⬜ AI-19 · [A11Y-17] No `prefers-reduced-motion` handling — **Low** 🔎
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
| AI-1f | Enter on group title does not deselect | P2 | Med | — | ⬜ open (pre-existing) |
| AI-1e | examples.cy.ts order coupling | P2 | Low | — | ⬜ partly mitigated (test debt) |
| AI-5 | Scroll O(n)/unthrottled | P1 | High | INP | ⬜ open |
| AI-8 | Placeholder/icon contrast | P1 | High | 1.4.3/1.4.11 | ⬜ open |
| AI-9 | No focus indicator | P1 | High | 2.4.7 | ⬜ open |
| AI-12 | Group headers role=option | P2 | Med | 1.3.1/4.1.2 | ⬜ open |
| AI-13 | Generic default label | P2 | Med | 2.4.6 | ⬜ open |
| AI-14 | Group aria-label raw HTML | P2 | Med | 4.1.2 | ⬜ open |
| AI-15 | Missing keys | P2 | Med | 2.1.1 | ⬜ partial |
| AI-16 | Fixed-px heights / zoom | P2 | Med | 1.4.4/1.4.10 | ⬜ open |
| AI-17 | willTextOverflow layout | P2 | Med | INP | ⬜ open |
| AI-18 | Backspace wipes selection | P2 | Low | 4.1.3 | ⬜ likely partly done — verify |
| AI-19 | No reduced-motion | P2 | Low | 2.3.3(AAA) | ⬜ open |
| AI-20 | Security hardening | P2 | Low | OWASP | ⬜ open |
| AI-21 | Docs CDN no SRI | P2 | Low | — | ⬜ open |

---

## Recommended order for the next pass

1. **AI-1b** — the only reason SEC-01 is still live for OutSystems consumers. One line, another repo.
2. **AI-8 + AI-9** — two High accessibility items, CSS-only, no behavioural risk.
3. **AI-5** — the last High performance item.
4. **AI-1c** — release note, required before shipping 1.4.0.
5. **AI-1f** — the group-title Enter deselect, now the only red test.
6. **AI-18 verification** — may already be complete; cheap to confirm.
7. Run **[ACCESSIBILITY-QA-SCRIPT.md](ACCESSIBILITY-QA-SCRIPT.md)** with a real screen reader against this branch, focusing on the new live-region wording and the changed arrow-key behaviour.
