# End-to-End Audit — `virtual-select-plugin` v1.3.0

**Scope:** Accessibility (WCAG 2.2 AA), Security, Performance
**Auditor role:** Staff Frontend / Application Security
**Date:** 2026-08-03
**Repo:** `virtual-select` (this repo only; fork `virtual-select-gnbm` excluded)

---

## 0. Methodology & Assumptions (recorded)

| Dimension | Decision |
|---|---|
| Surface | `src/` source **+** shipped `dist/` artifacts |
| Dependencies | `tooltip-plugin` (runtime), `popover-plugin` — trust boundaries; integration points only |
| Consumer frame | Generic OSS library; notes added where the OutSystems UI wrapper changes the picture |
| Threat model | Option data assumed attacker-influenced (UGC) |
| A11y target | WCAG 2.2 **AA**; AAA flagged informationally |
| Primary AT | NVDA/Chrome, VoiceOver/Safari |
| Perf tiers | Desktop unthrottled **+ 4× CPU** throttle |
| Secure-text posture | `enableSecureText` off = accepted, documented risk; hardening recommended |

**Tooling:** static review of `src/virtual-select.js` (4009 lines), `src/utils/*.js`, `src/sass/**`, `dist/*`; live verification in Chrome via Chrome DevTools (real input events + accessibility tree), unthrottled and at 4× CPU; `npm audit`; gzip/brotli size measurement. A self-contained harness (6 instances incl. 100k options and two XSS probes) was served over `http://localhost:8199/`.

**Verification legend:** ✅ verified live this session · 🔎 code-verified (read/grep, not individually run) · ⚠️ did **not** reproduce in the shipped bundle.

---

## 1. Executive Summary

| Category | Readiness /100 | Verdict |
|---|---|---|
| **Security** | 72 | Escaping primitive is correct and effective *when enabled*; insecure-by-default is the dominant risk but is documented and warns once. Supply chain clean. |
| **Accessibility** | 62 | Good combobox scaffolding and virtualization-aware ARIA, but confirmed AA blockers: Escape doesn't close (default desktop), arrow keys dropped from search, no status announcements, Select All has no role/state, placeholder contrast fails, required/error not exposed. |
| **Performance** | 65 | Excellent virtualization and lean bundle, undermined by an unthrottled scroll path doing O(n) work per frame on large lists. |

**Severity tally (all categories):** Critical 0 · High 9 · Medium 8 · Low/Info 6.

**Measured evidence:**
- Bundle: `virtual-select.min.js` 87.6 KB raw / **22.1 KB gzip** / 19.2 KB brotli; `virtual-select.min.css` 13.4 KB / **2.7 KB gzip** / 2.3 KB brotli. Plus required runtime deps `popover.min.js` ~21.7 KB + `tooltip.min.js` ~12.1 KB raw.
- 100k-option init: ~38 ms unthrottled. 10k init: ~43 ms @ 4× CPU.
- Scroll re-render @ 100k: **~9.5 ms unthrottled / ~44 ms @ 4× CPU** per event; the `calculateAriaMetadata()` O(n) scan is ~3.9 ms of that and runs every render.
- `npm audit`: **0 vulnerabilities** (prod and dev).
- DOM XSS: **executed live** with default config; neutralized with `enableSecureText: true`.

---

## 2. SECURITY

### 2.1 Summary
0 Critical, 1 High (raw technical severity; Medium residual given the documented trade-off), 3 Low/Info. Supply chain clean. The escaping control works; the risk is that it is off by default.

### 2.2 Findings

#### [SEC-01] DOM-based XSS via option fields when `enableSecureText` is off (default) — **High (residual: Medium, documented)** ✅
- **Standard:** OWASP A03:2021 (Injection) / DOM XSS.
- **Where:** `renderOptions()` [src/virtual-select.js:423-433], `setValueText()` [src/virtual-select.js:1855-1864]; `secureText()` is a no-op unless enabled [src/virtual-select.js:3654-3662]; default off [src/virtual-select.js:1119].
- **Risk:** Option `label`/`value`/`description`/`customData` are interpolated into `innerHTML`. Under the UGC assumption, untrusted option text executes arbitrary script.
- **Repro (confirmed live):** default config + `label: '<img src=x onerror=…>'` → `xssFired === true`, real `<img>` created, canary flipped to `XSS-FIRED-DEFAULT`. With `enableSecureText: true` the same payload rendered inert (`&lt;img …&gt;`, no element).
- **Mitigations already present (good):** once-per-page `console.warn` [src/virtual-select.js:3672-3687]; `sanitizeClassNames()` strips `"<>` [src/utils/utils.js:250-252]; `customData` secured in aria-labels [src/virtual-select.js:385-393].
- **Remediation:** consider secure-by-default in a major version:
  ```js
  // setProps — after
  this.enableSecureText = convertToBoolean(options.enableSecureText, true); // opt OUT for raw-HTML/perf
  ```
  Interim: expose a global default so a host (OutSystems wrapper) can enforce it centrally.
- **OutSystems note:** exploitability hinges on whether the wrapper forces `enableSecureText` and whether it forwards end-user data into option fields. **Confirm the wrapper's setting** — that decides live-High vs documented-Low.

#### [SEC-02] Raw `name` interpolated into an attribute when secureText off — **Low** 🔎
- Hidden input `name` built via interpolation [src/virtual-select.js:186], only passes through default-off `secureText` [src/virtual-select.js:1151]. A `"` in `name` breaks the attribute. The DOM-property assignment [src/virtual-select.js:1294] is already safe; drop the attribute variant or fix via SEC-01.

#### [SEC-03] Untrusted values as plain-object map keys — **Low (correctness)** 🔎
- Lookup maps keyed by option values (e.g. [src/virtual-select.js:1354-1357], [src/virtual-select.js:2173-2175]). Not prototype pollution (`obj['__proto__']=true` is a no-op), but a value of `__proto__`/`constructor` yields wrong membership. Prefer `Object.create(null)` / `Map`.

#### [SEC-04] Over-escaping of quotes in secure mode — **Info** ✅
- `secureText` pre-replaces `"`→`&quot;` then serializes through a text node, so a literal quote renders as visible `&amp;quot;`. Safe but cosmetically wrong for labels containing quotes. Use a single canonical escape pass.

*Out of scope (docs, not shipped):* `docs/index.html` loads third-party CDN scripts (Google Fonts, `netdna.bootstrapcdn.com` font-awesome 3.2.1, GA/GTM) with no SRI. Add SRI/pin versions if the docs are public.

---

## 3. ACCESSIBILITY (WCAG 2.2 AA)

### 3.1 Summary
Strong scaffolding — `role=combobox`, `aria-haspopup`, `aria-expanded`, `aria-controls`, per-option `aria-selected`, focus sentinels, and virtualization-aware `aria-setsize`/`aria-posinset`. But six confirmed AA blockers. 0 Critical, 6 High, 5 Medium, 3 Low/Info.

### 3.2 Findings

#### [A11Y-01] Arrow keys dropped while search input focused — **High** ✅
- **WCAG:** 2.1.1 (A). **Where:** `onDownArrowPress`/`onUpArrowPress` early-return on search focus [src/virtual-select.js:651-654, 665-668].
- **AX-tree capture (real input):** open → focus `textbox "Search"` (no `role=combobox`, no `aria-activedescendant`). **ArrowDown → no change**: `search aria-activedescendant=null`, `wrapper aria-activedescendant=null`, no `.focused` option → **AT announces nothing**. Only after **Tab** into the listbox do arrows work (first option → `option "Europe, Select All", posinset 1, setsize 8, selected false`).
- **Fix:** drive an `aria-activedescendant` highlight from the search input on arrows (APG editable-combobox), keeping DOM focus in the field.

#### [A11Y-02] Escape does not close in default desktop config — **High** ✅
- **WCAG:** 2.1.1 / 2.1.2 (A). **Where:** [src/virtual-select.js:623-633] picks `showAsPopup ? $wrapper : $dropboxWrapper`; with default `dropboxWrapper: 'self'`, `$dropboxWrapper` is `undefined` (`hasDropboxWrapper=false`), so the branch is skipped.
- **Repro (live):** desktop width, open, Escape → **stays open** (confirmed both from search and with an option focused). Works only in popup mode / external wrapper.
- **Fix:**
  ```js
  const wrapper = this.hasDropboxWrapper && !this.showAsPopup ? this.$dropboxWrapper : this.$wrapper;
  ```

#### [A11Y-03] No status announcements (dead `.vscomp-live-region` CSS) — **High** ✅
- **WCAG:** 4.1.3 (AA). Zero `aria-live`/`role=status` in the component (confirmed: 0 live regions in DOM). `.vscomp-no-search-results` gets `tabindex=0`/`aria-hidden=false` [src/virtual-select.js:992-998] but is not announced. The `.vscomp-live-region` class ships in CSS [src/sass/partials/virtual-select.scss:279] but no JS creates the element.
- **Fix:** create one visually-hidden `role="status" aria-live="polite"` per instance; update on search-result count, no-results, server-search loading, and selection changes.

#### [A11Y-04] "Select All" has no role, no checked state, no Space activation — **High** ✅
- **WCAG:** 4.1.2 / 1.3.1 / 2.1.1 (A). **Where:** `<span … tabindex=0 aria-label>` [src/virtual-select.js:453-456]; checked = CSS class only [src/virtual-select.js:3188]; Enter-only [src/virtual-select.js:617-620].
- **AX-tree capture:** exposed as **`generic "Select All"`** — `role=null`, `aria-checked=null`. **Space → no-op** (selected count 0→0). **Enter → toggles** (0→6, checkbox checked) but no `aria-checked` so the state change is inaudible.
- **Fix:** `role="checkbox"` + synced `aria-checked`; handle keyCode 32 alongside 13.

#### [A11Y-05] `aria-activedescendant` on a role-less div, never on the focused search input — **High** ✅
- **WCAG:** 4.1.2 (A). Set on `$wrapper` **and** `$dropboxContainer` (plain div) [src/virtual-select.js:3717-3721]; search input has neither `role=combobox` nor `aria-activedescendant` (confirmed null). Combined with A11Y-01, filtered highlights are never announced.

#### [A11Y-06] Missing `aria-multiselectable` on the listbox — **Medium** ✅
- **WCAG:** 4.1.2 / 1.3.1 (A). Listbox `role=listbox` [src/virtual-select.js:252] but `aria-multiselectable=null` in multiple mode (confirmed). AT presents single-select semantics. **Fix:** add `aria-multiselectable="true"` when `this.multiple`.

#### [A11Y-07] Required/error not exposed; color-only indication — **High** ✅
- **WCAG:** 3.3.1 / 1.4.1 / 4.1.2 (A). `validate()` toggles only a `has-error` class [src/virtual-select.js:3548-3568]; **no `aria-required`, no `aria-invalid`** (confirmed null before and after a failed submit); no error message; no live region; error is a border-color change only.
- **Fix:** set `aria-required`/`aria-invalid`; render an announced error message; add a non-color cue.

#### [A11Y-08] Focus indicator suppressed on the combobox — **High** ✅
- **WCAG:** 2.4.7 / 1.4.11 (AA); AAA 2.4.13. `.vscomp-wrapper:focus { outline: none }` [src/sass/partials/virtual-select.scss:31-33]; live computed on the closed wrapper: **`outline-style: none`, `box-shadow: none`** — effectively no visible focus indicator. In-list highlight `#ccc` = **1.61:1** (fails 3:1 non-text).
- **Fix:** `:focus-visible { outline: 2px solid <primary>; outline-offset: 2px }`; darken the `.focused` option cue.

#### [A11Y-09] Default-theme contrast failures — **High** ✅
- **WCAG:** 1.4.3 / 1.4.11 (AA). Computed live: placeholder `#333 @ opacity 0.5` → effective **#999 = 2.85:1** (fails 4.5 normal text); clear/arrow icons `#999` = **2.85:1** (fails 3:1 non-text); focused-option bg `#ccc` = **1.61:1**. Body text `#333` and description `#666` pass.
- **Fix:** replace opacity-dimming with explicit colors (`#595959` for 7:1, `#767676` minimum for icons).

#### [A11Y-10] Group headers exposed as `role="option"` — **Medium** ✅
- **WCAG:** 1.3.1 / 4.1.2 (A). Headers render as `role=option` [src/virtual-select.js:356-367, 423]; AX capture shows "Europe, Select All" / "Americas, Select All" as `option selectable`, indistinguishable from real options, and **counted in `aria-setsize`** (setsize 8 = 2 headers + 6 options → inflated "X of Y"). **Fix:** `role="presentation"` for non-interactive headers, `role="checkbox" aria-checked="mixed"` for interactive multi-select headers.

#### [A11Y-11] Generic default `aria-label="Options list"` — **Medium** ✅
- **WCAG:** 2.4.6 / 4.1.2 (A). Default applied on the combobox [src/virtual-select.js:185, 1222]; AX capture: instances without `ariaLabelledby` announce "Options list"; the closed combobox value is a garbled concatenation of subtree text. **Fix:** don't default `aria-label`; encourage `ariaLabelledby`.

#### [A11Y-12] Group-option `aria-label` uses raw label HTML — **Medium** 🔎
- **WCAG:** 4.1.2 / 1.1.1 (A). `aria-label` interpolates raw `d.label` [src/virtual-select.js:391-393]; with HTML/icon labels the name becomes tag-soup or truncates at the first `"`. Reuse the HTML-strip already used for tag buttons [src/virtual-select.js:1851].

#### [A11Y-13] Target sizes below 24×24 — **Medium** ✅
- **WCAG:** 2.5.8 (AA). Measured: Select-All **25×15**, tag clear-button **20×20**. **Fix:** `min-height/min-width: 24px`.

#### [A11Y-14] Missing keys: Space-to-open, Home/End/PageUp-Down, typeahead — **Medium** 🔎
- **WCAG:** 2.1.1 (A) partial. Key map is Enter/Up/Down/Del/Backspace only [src/virtual-select.js:9-15]; Space on the focused wrapper scrolls the page. **Fix:** add Space-to-open, Home/End, and first-char typeahead for non-search mode.

#### [A11Y-15] Fixed-px heights clip at 200% zoom — **Medium** 🔎
- **WCAG:** 1.4.4 / 1.4.10 / 1.4.12 (AA). `.vscomp-value` 20px, inline px option heights feed the virtualizer. **Fix:** `em`/`min-height` sizing; derive `optionHeight` from a measured probe row.

#### [A11Y-16] Backspace/Delete on focused closed combobox wipes selection silently — **Low** 🔎
- **WCAG:** 4.1.3 (AA). `onBackspaceOrDeletePress` → `reset()` [src/virtual-select.js:678-685], no announcement.

#### [A11Y-17] No `prefers-reduced-motion` — **Low (AAA-adjacent)** 🔎
- Popover slide + spinner ignore the media query. **Fix:** zero transition durations under `prefers-reduced-motion: reduce`.

#### Did NOT reproduce ⚠️ (flagged to prevent wasted effort)
- **Group-header text at 3.69:1** (from `variable.scss opacity: 0.6`): shipped `dist` showed the multi-select group title as **black, opacity 1** — not reproduced.
- **"Tab closes the dropdown via focus sentinel / options unreachable":** not reproduced — Tab landed on the listbox container with the dropdown open, and arrows then worked.

---

## 4. PERFORMANCE

### 4.1 Summary
Virtualization renders only ~`optionsCount×2` nodes; bundle is lean. The scroll interaction path is the weak point. 0 Critical, 2 High, 1 Medium, 1 Low.

### 4.2 Findings

#### [PERF-01] Unthrottled scroll handler does full re-render work per event — **High** ✅
- **Metric:** INP / long tasks / 16.7 ms frame budget. `onOptionsScroll → setVisibleOptions(true)` bound with no throttle/rAF [src/virtual-select.js:503, 719-721].
- **Measured:** one scroll re-render @ 100k = **~9.5 ms unthrottled / ~43.9 ms @ 4× CPU**; scroll fires many times per drag → sustained main-thread blocking.
- **Fix:** coalesce into one frame with `requestAnimationFrame` (cancel in `destroy()`).

#### [PERF-02] `calculateAriaMetadata()` scans all options every render — **High** ✅
- Full-set iteration [src/virtual-select.js:2039-2081] called unconditionally at the top of `renderOptions()` [src/virtual-select.js:293-294] — i.e. on every scroll tick and keystroke. **Measured:** ~3.9 ms/call @ 100k (~40% of PERF-01 cost). **Fix:** recompute only when the filtered set changes; cache `filteredIndex`; read it in `renderOptions()`.

#### [PERF-03] `willTextOverflow()` forces synchronous layout per tag/value — **Medium** 🔎
- Temp element appended to `<body>`, `clientWidth` read, removed, with two `getComputedStyle` calls [src/utils/utils.js:197-209], once per selected tag [src/virtual-select.js:1845]. **Fix:** cache a single measurer + font; or use `scrollWidth > clientWidth` on the real node.

#### [PERF-04] Linear, front-loaded init cost — **Low** ✅
- 10k init ≈ **42.7 ms @ 4× CPU** (~11 ms unthrottled); 100k ≈ 38 ms unthrottled. Consider chunking/deferring `setOptions` normalization for very large lists.

---

## 5. Prioritized Remediation Roadmap

**P0 — Immediate (AA blockers / security decision)**
1. [SEC-01] Decide `enableSecureText` posture; confirm the OutSystems wrapper's setting.
2. [A11Y-02] Escape-in-self-mode (one-line fix, verified broken).
3. [A11Y-04] Select All → `role="checkbox"` + `aria-checked` + Space.
4. [A11Y-07] `aria-required`/`aria-invalid` + announced error message.

**P1 — Near-term**
5. [PERF-02] then [PERF-01] — move ARIA scan off the render path, rAF-coalesce scroll.
6. [A11Y-01]/[A11Y-05] Arrow-key navigation via `aria-activedescendant` from the search input.
7. [A11Y-03] Add the live region (CSS already ships).
8. [A11Y-09] Contrast: replace opacity-dimming with explicit colors.
9. [A11Y-06] `aria-multiselectable`; [A11Y-13] target sizes ≥ 24px.

**P2 — Structural / next major**
10. [A11Y-08] `:focus-visible` outline; [A11Y-10] group-header semantics; [A11Y-11] drop generic default name; [A11Y-12] strip HTML in group aria-labels; [A11Y-14] keyboard completeness; [A11Y-15] zoom/reflow sizing.
11. [PERF-03] measurer refactor; [SEC-03/04] `Map`/`Object.create(null)`, single-pass escaping; docs SRI.

---

## 6. Appendices

### Appendix A — Environment & tooling
- Chrome DevTools (MCP) for real-input interaction + accessibility-tree capture; 4× CPU emulation for the low-end tier.
- Harness: `scratchpad/index.html` served at `http://localhost:8199/` (6 instances incl. 100k options + XSS probes), built from `dist/` + `popover`/`tooltip` runtime deps.
- Sizes via `gzip -c | wc -c` and `brotli -c | wc -c`; supply chain via `npm audit`.

### Appendix B — Screen-reader QA script
See **[ACCESSIBILITY-QA-SCRIPT.md](ACCESSIBILITY-QA-SCRIPT.md)** — step-by-step NVDA + VoiceOver manual test script with a recording template, to capture a literal Speech Viewer / caption transcript for tickets.

### Appendix C — Verification caveats
- Screen-reader findings are grounded in Chrome's **accessibility tree** (role/name/state) captured under real input, not a literal NVDA/VoiceOver recording (NVDA not installed in the audit environment; VoiceOver is macOS-only). The role/name/state is authoritative; AT phrasing varies — hence Appendix B for a human-run transcript.
- Items marked 🔎 are code-verified but not individually executed; ⚠️ items did not reproduce in the shipped bundle and should not be actioned without re-confirmation.
