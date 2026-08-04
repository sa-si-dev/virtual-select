# Virtual Select — Screen Reader QA Script (NVDA + VoiceOver)

**Component:** `virtual-select-plugin` v1.3.0
**Purpose:** Manually verify the two confirmed screen-reader defects (arrow-key navigation from search; "Select All" role/state) plus supporting a11y items, and produce a literal Speech Viewer / VoiceOver transcript to attach to a ticket.
**Prereq:** A page with a **multi-select** instance (search auto-enabled) and a **required single-select** inside a `<form>`. The audit harness (`scratchpad/index.html`) works, or use the docs "Multiple select" and "Validation" examples.

> The audit captured the **accessibility tree** Chrome exposes to AT (role/name/state) at each step. This script has a human re-run the same steps with a real screen reader so the actual spoken output is recorded. Where the expected announcement is given, it is derived from the captured role/name/state; exact phrasing varies by AT/version.

---

## Environment matrix

| AT | Browser | OS | Notes |
|---|---|---|---|
| NVDA (latest) | Chrome (latest) | Windows 10/11 | Primary. Use **Tools → Speech Viewer** to capture text. |
| VoiceOver | Safari (latest) | macOS | Primary. Use the VoiceOver caption panel (VO+F8 → Visuals) to capture text. |
| JAWS (optional) | Chrome/Edge | Windows | Secondary confirmation. |

**Capture setup (NVDA):** Start NVDA → NVDA menu (Insert+N) → Tools → Speech Viewer (tick it). All speech is mirrored as text you can copy.
**Capture setup (VoiceOver):** VO+F8 to open VoiceOver Utility → Visuals → Caption Panel → enable. Or screen-record with captions on.

---

## TEST 1 — Arrow-key navigation from the search box  *(defect: HIGH, WCAG 2.1.1)*

**Expected-correct behavior (APG combobox):** while typing/filtering, ArrowDown/Up move a highlight through the options and each active option is announced, with focus staying in the search field.

| # | Action | Expected announcement (correct) | **Actual (v1.3.0) — record what you hear** |
|---|---|---|---|
| 1.1 | Tab to the multi-select, press Enter to open | "Choose regions, combobox, expanded" then "Search, edit" | ___ |
| 1.2 | Press **ArrowDown** | An option, e.g. "Europe, Select All, 1 of N" | **Expected FAIL: silence** (no active option, no `aria-activedescendant`) — confirm nothing is spoken |
| 1.3 | Press **ArrowDown** three more times | Successive options announced | **Expected FAIL: silence** each time |
| 1.4 | Press **Tab** | (non-standard) focus moves into the list | Record what is announced (likely "list box" or first option) |
| 1.5 | Press **ArrowDown** | "Europe, Select All, 1 of 8, not selected" | Record — options should now navigate |
| 1.6 | Type `port` in search, then try ArrowDown | Filtered "Portugal" announced as active | **Expected FAIL: silence** until you Tab out of the field |

**Pass criteria:** steps 1.2/1.3/1.6 announce the active option. **Known result: FAIL** — arrow keys are dropped while the search input has focus.

---

## TEST 2 — "Select All" control  *(defect: HIGH, WCAG 4.1.2 / 2.1.1)*

**Expected-correct behavior:** a checkbox named "Select All" that announces its checked/unchecked state and toggles on Space.

| # | Action | Expected announcement (correct) | **Actual (v1.3.0) — record** |
|---|---|---|---|
| 2.1 | Open the multi-select; Shift+Tab (or navigate) to "Select All" | "Select All, checkbox, not checked" | **Expected FAIL:** "Select All" with **no role/state** (exposed as generic text) |
| 2.2 | Press **Space** | State toggles → "checked" announced | **Expected FAIL: nothing happens** (Space is a no-op) |
| 2.3 | Press **Enter** | State toggles → "checked" announced | Selects all, **but no state change announced** (`aria-checked` absent) |
| 2.4 | In NVDA elements list (Insert+F7) / VO rotor, look for a "Select all" checkbox | Present as a checkbox/form control | **Expected FAIL:** not listed as a form control |

**Pass criteria:** 2.1 announces role "checkbox" + state; 2.2 toggles on Space. **Known result: FAIL** on 2.1, 2.2, and the 2.3 state announcement.

---

## TEST 3 — Escape to dismiss  *(defect: HIGH, WCAG 2.1.1/2.1.2)*

Run at desktop width (≥ 1024px) with the **default** config (`dropboxWrapper: 'self'`).

| # | Action | Expected | **Actual (v1.3.0)** |
|---|---|---|---|
| 3.1 | Open the dropdown, press **Escape** (focus in search) | Dropdown closes, focus returns to combobox | **Expected FAIL: stays open** |
| 3.2 | Repeat at < 576px width (popup mode) | Dropdown closes | Expected PASS (popup mode uses `$wrapper`) |

**Known result:** FAIL at desktop width; works only in mobile popup mode or with an external `dropboxWrapper`.

---

## TEST 4 — Status / no-results announcements  *(defect: HIGH, WCAG 4.1.3)*

| # | Action | Expected | **Actual (v1.3.0)** |
|---|---|---|---|
| 4.1 | Open searchable select, type `zzzzzz` | "No results found" announced automatically (live region) | **Expected FAIL: silence** (message shown visually, no `aria-live`) |
| 4.2 | Type a valid filter | "N results available" announced | **Expected FAIL: silence** |
| 4.3 | Toggle an option in multi-select while focus stays in search | "X selected/deselected, N selected" | **Expected FAIL: silence** |

**Known result:** FAIL — there is no live region (the `.vscomp-live-region` CSS ships but no element is created).

---

## TEST 5 — Required / error state  *(defect: HIGH, WCAG 3.3.1 / 1.4.1)*

Use the required single-select inside a `<form>`.

| # | Action | Expected | **Actual (v1.3.0)** |
|---|---|---|---|
| 5.1 | Focus the empty required field | "… required" announced | **Expected FAIL:** no "required" (`aria-required` absent) |
| 5.2 | Submit the form empty | Error announced + field marked invalid | **Expected FAIL:** submission blocked with **no announcement**, `aria-invalid` absent |
| 5.3 | Observe the error indication | Text + non-color cue | **Expected FAIL:** color-only border change |

---

## TEST 6 — Combobox name & value  *(defect: MEDIUM, WCAG 2.4.6/4.1.2)*

| # | Action | Expected | **Actual (v1.3.0)** |
|---|---|---|---|
| 6.1 | Tab to an instance configured **without** `ariaLabelledby`/`ariaLabelText` | The field's real purpose (e.g. "Country") | **Expected FAIL:** "Options list" (generic default) |
| 6.2 | Select a value, Tab away and back | Current value announced clearly | Record — value may be a garbled concatenation of subtree text |

---

## TEST 7 — Group headers  *(defect: MEDIUM, WCAG 1.3.1/4.1.2)*

| # | Action | Expected | **Actual (v1.3.0)** |
|---|---|---|---|
| 7.1 | Navigate a grouped list; reach a group header | Announced as a group/heading, not a peer option | **Expected FAIL:** "Europe, Select All, **option**, 1 of 8" — same role as real options |
| 7.2 | Compare announced "X of Y" to visible option count | Match | **Expected FAIL:** `aria-setsize` counts headers, inflating position math |

---

## Recording template (paste per AT)

```
AT / version:            NVDA ____  |  VoiceOver ____
Browser / OS:            ____
Date / tester:           ____

TEST 1 (arrow keys):     1.2 [PASS/FAIL] "____"   1.5 [PASS/FAIL] "____"   1.6 [PASS/FAIL] "____"
TEST 2 (select all):     2.1 [PASS/FAIL] "____"   2.2 [PASS/FAIL]          2.3 [PASS/FAIL] "____"
TEST 3 (escape):         3.1 [PASS/FAIL]          3.2 [PASS/FAIL]
TEST 4 (status):         4.1 [PASS/FAIL]          4.3 [PASS/FAIL]
TEST 5 (required):       5.1 [PASS/FAIL] "____"   5.2 [PASS/FAIL]
TEST 6 (name/value):     6.1 [PASS/FAIL] "____"   6.2 "____"
TEST 7 (groups):         7.1 [PASS/FAIL] "____"

Speech Viewer / caption transcript attached: [ ] yes
```
