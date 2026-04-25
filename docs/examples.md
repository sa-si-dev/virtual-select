# Examples

- [Default dropdown](#default-dropdown)
- [With search box](#with-search-box)
- [Multiple select](#multiple-select)
- [Multiple select without search](#multiple-select-without-search)
- [Disabled options](#disabled-options)
- [Option group](#option-group)
- [Preselect value](#preselect-value)
- [Preselect multiple values](#preselect-multiple-values)
- [Hide clear button](#hide-clear-button)
- [Custom width for dropbox](#custom-width-for-dropbox)
- [Allow to add new option](#allow-to-add-new-option)
- [Mark matched term in label](#mark-matched-term-in-label)
- [Showing selected options first](#showing-selected-options-first)
- [Using alias for searching](#using-alias-for-searching)
- [Keep dropbox always open](#keep-dropbox-always-open)
- [Maximum values](#maximum-values)
- [Label with description](#label-with-description)
- [Description search normalize](#description-search-normalize)
- [Multi-language search normalize](#multi-language-search-normalize)
- [Show dropbox as popup](#show-dropbox-as-popup)
- [Server search](#server-search)
- [Show options only on search](#show-options-only-on-search)
- [Add image/icon](#add-imageicon)
- [Show values as tags](#show-values-as-tags)
- [Right-to-Left text](#right-to-left-text)
- [Disable/Enable](#disable-enable)
- [Validation](#validation)
- [Custom styling](#custom-styling)

## Default dropdown

<div id="single-select"></div>

```html
<div id="sample-select"></div>
```

```js
VirtualSelect.init({
  ele: '#sample-select',
  options: [
    { label: 'Options 1', value: '1' },
    { label: 'Options 2', value: '2' },
    { label: 'Options 3', value: '3' },
  ],
});
```

## With search box

<div id="single-search-select"></div>

```js
VirtualSelect.init({
  ...
  search: true,
});
```

## Multiple select

<div id="sample-multi-select"></div>

```js
VirtualSelect.init({
  ...
  multiple: true,
});
```

## Multiple select without search

<div id="multi-select-without-search"></div>

```js
VirtualSelect.init({
  ...
  multiple: true,
  search: false,
});
```

## Disabled options

<div id="single-disabled-select"></div>

```js
VirtualSelect.init({
  ...
  disabledOptions: [2, 6, 9],
});
```

## Option group

Option group could be added by adding nested options

<div id="option-group-select"></div>

```js
VirtualSelect.init({
  ...
  options: [
    { 
      label: 'Option Group 1',
      options: [
        { label: 'Option 1-1', value: '1' },
        ...
      ]
    },
    ...
  ]
});
```

## Preselect value

<div id="preselect-single-select"></div>

```js
VirtualSelect.init({
  ...
  selectedValue: 3,
});
```

## Preselect multiple values

<div id="preselect-multiple-select"></div>

```js
VirtualSelect.init({
  ...
  multiple: true,
  selectedValue: [3, 4],
});
```

## Hide clear button

<div id="hide-clear-select"></div>

```js
VirtualSelect.init({
  ...
  hideClearButton: true,
});
```

## Custom width for dropbox

<div id="custom-width-select"></div>

```js
VirtualSelect.init({
  ...
  dropboxWidth: '130px',
});
```

## Allow to add new option

To add new option, enter new value in the search box.

<div id="new-option-select"></div>

```js
VirtualSelect.init({
  ...
  allowNewOption: true,
});
```

## Mark matched term in label

Try searching in below dropdown. Matched letters would be highlighted.

<div id="mark-results-select"></div>

```js
VirtualSelect.init({
  ...
  markSearchResults: true,
});
```

## Showing selected options first

Show selected options at the top of the dropbox on reopen

<div id="selected-first-select"></div>

```js
VirtualSelect.init({
  ...
  showSelectedOptionsFirst: true,
});
```

## Using alias for searching

Alias value could be an array or comma separated string. Try alias in searching.

<div id="alias-select"></div>

```js
VirtualSelect.init({
  ...
  options: [
    { label: 'Colors', value: 'colors', alias: 'Orange, Red' },
    { label: 'Fruits', value: 'fruits', alias: ['Orange', 'Apple'] },
    { label: 'Months', value: 'months', alias: 'January' },
    { label: 'Others', value: 'others' }
  ]
});
```

## Keep dropbox always open

Keep dropbox always open with fixed height

<div id="keep-open-select"></div>

```js
VirtualSelect.init({
  ...
  keepAlwaysOpen: true,
});
```

## Maximum values

Maximum no.of options allowed to choose in multiple select

<div id="max-values-select"></div>

```js
VirtualSelect.init({
  ...
  maxValues: 4,
});
```


## Label with description

<div id="with-description-select"></div>

```js
VirtualSelect.init({
  ...
  options: [
    { label: 'Options 1', value: '1', description: 'Description 1' },
    { label: 'Options 2', value: '2', description: 'Description 2' },
    { label: 'Options 3', value: '3', description: 'Description 3' },
  ],
  hasOptionDescription: true
});
```

## Description search normalize

<div id="with-description-search-select"></div> <span style="font-size: .8rem; margin-left: 5px;">searchNormalize: false</span>

<br>

<div id="with-description-normalized-search-select"></div> <span style="font-size: .8rem; margin-left: 5px;">searchNormalize: true</span>

```js
const options = [
  { label: 'Alpha', value: 'alpha', description: 'Café central' },
  { label: 'Beta', value: 'beta', description: 'Crème brûlée' },
];

VirtualSelect.init({
  ...
  ele: '#with-description-search-select',
  options,
  search: true,
  hasOptionDescription: true,
  searchNormalize: false
});

VirtualSelect.init({
  ...
  ele: '#with-description-normalized-search-select',
  options,
  search: true,
  hasOptionDescription: true,
  searchNormalize: true
});
```

## Multi-language search normalize

A single dropdown can contain options across many writing systems — Latin (with diacritics, including German, Norwegian, Swedish, and Finnish), Greek, Cyrillic, Vietnamese, Chinese, Japanese, Korean, Arabic, and Thai. With `searchNormalize: true`, the search input and option labels/descriptions are normalized via Unicode NFD and stripped of combining marks (`\p{M}`), enabling diacritic-insensitive matching across scripts.

Examples to try with `searchNormalize: true`:
- Latin (French/Spanish): `creme` finds `Crème brûlée`, `nino` finds `Niño`
- German: `Munchen` finds `München`, `Koln` finds `Köln`, `Madchen` finds `Mädchen`
- Norwegian: `Alesund` finds `Ålesund` (note: `ø`, `æ` are atomic and **not** stripped — `Tromso` does **not** find `Tromsø`)
- Swedish: `Goteborg` finds `Göteborg`, `Malmo` finds `Malmö`
- Finnish: `Jyvaskyla` finds `Jyväskylä`
- Greek: `Ενα` finds `Ένα`
- Cyrillic: `Ежик` finds `Ёжик`
- Vietnamese: `Viet Nam` finds `Việt Nam`, `Ha Noi` finds `Hà Nội`
- Arabic: `مرحبا` finds `مُرَحَّباً` (tashkeel stripped)
- Korean: searching `한국어` matches `한국어` (NFD decomposes Hangul syllables to jamo; both sides are normalized symmetrically)
- Chinese / Japanese kanji & katakana: characters have no combining marks, so they are matched as-is (previously broken under the old regex)

With `searchNormalize: false`, only exact (case-insensitive) matches are returned.

<div id="multi-language-search-select"></div> <span style="font-size: .8rem; margin-left: 5px;">Multi-language - searchNormalize: true</span>

<br>
<br>

<div id="multi-language-search-no-normalize-select"></div> <span style="font-size: .8rem; margin-left: 5px;">Multi-language - searchNormalize: false</span>

```js
const multiLanguageOptions = [
  // Latin (French / Spanish)
  { label: 'Crème brûlée', value: 'creme-brulee', description: 'French dessert' },
  { label: 'Niño', value: 'nino', description: 'Spanish word for child' },
  // German
  { label: 'München', value: 'munchen', description: 'Stadt in Deutschland' },
  { label: 'Mädchen', value: 'madchen', description: 'Junges weibliches Kind' },
  { label: 'Größe', value: 'grosse', description: 'Maß für die Ausdehnung' },
  // Norwegian
  { label: 'Ålesund', value: 'alesund', description: 'By på vestlandskysten' },
  { label: 'Bjørn', value: 'bjorn', description: 'Stort pattedyr' },
  // Swedish
  { label: 'Göteborg', value: 'goteborg', description: 'Stad på Sveriges västkust' },
  { label: 'Malmö', value: 'malmo', description: 'Stad i södra Sverige' },
  // Finnish
  { label: 'Jyväskylä', value: 'jyvaskyla', description: 'Kaupunki Keski-Suomessa' },
  { label: 'Hämeenlinna', value: 'hameenlinna', description: 'Kaupunki Kanta-Hämeessä' },
  // Greek
  { label: 'Ένα', value: 'ena', description: 'Πρώτο στοιχείο' },
  { label: 'Αθήνα', value: 'athina', description: 'Πρωτεύουσα της Ελλάδας' },
  // Cyrillic
  { label: 'Ёжик', value: 'yozhik', description: 'Колючий зверёк' },
  { label: 'Москва', value: 'moskva', description: 'Столица России' },
  // Vietnamese
  { label: 'Việt Nam', value: 'vietnam', description: 'Quốc gia Đông Nam Á' },
  { label: 'Hà Nội', value: 'hanoi', description: 'Thủ đô của Việt Nam' },
  // Chinese
  { label: '北京', value: 'beijing', description: '中国的首都' },
  { label: '你好', value: 'nihao', description: '问候语' },
  // Japanese
  { label: '東京', value: 'tokyo', description: '日本の首都' },
  { label: 'カタカナ', value: 'katakana', description: '日本の文字' },
  // Korean
  { label: '서울', value: 'seoul', description: '한국의 수도' },
  { label: '한국어', value: 'hangugeo', description: '한국의 언어' },
  // Arabic
  { label: 'مُرَحَّباً', value: 'marhaba', description: 'تحية' },
  // Thai
  { label: 'กรุงเทพ', value: 'bangkok', description: 'เมืองหลวงของประเทศไทย' },
];

VirtualSelect.init({
  ele: '#multi-language-search-select',
  options: multiLanguageOptions,
  search: true,
  hasOptionDescription: true,
  searchNormalize: true,
});

VirtualSelect.init({
  ele: '#multi-language-search-no-normalize-select',
  options: multiLanguageOptions,
  search: true,
  hasOptionDescription: true,
  searchNormalize: false,
});
```

### Multi-language with values as tags

Multi-select variant — chosen options render as removable tags. Search normalization works the same way across all scripts.

<div id="multi-language-tags-search-select"></div> <span style="font-size: .8rem; margin-left: 5px;">Tags - searchNormalize: true</span>

<br>
<br>

<div id="multi-language-tags-search-no-normalize-select"></div> <span style="font-size: .8rem; margin-left: 5px;">Tags - searchNormalize: false</span>

```js
VirtualSelect.init({
  ele: '#multi-language-tags-search-select',
  options: multiLanguageOptions,
  multiple: true,
  search: true,
  hasOptionDescription: true,
  showValueAsTags: true,
  searchNormalize: true,
});

VirtualSelect.init({
  ele: '#multi-language-tags-search-no-normalize-select',
  options: multiLanguageOptions,
  multiple: true,
  search: true,
  hasOptionDescription: true,
  showValueAsTags: true,
  searchNormalize: false,
});
```

### Multi-language as popup

Popup variant — the dropbox renders as a popup (using `popupDropboxBreakpoint: '3000px'` for demo so the popup is visible on desktop too). Diacritic-insensitive search behaves identically inside the popup.

<div id="multi-language-popup-search-select"></div> <span style="font-size: .8rem; margin-left: 5px;">Popup - searchNormalize: true</span>

<br>
<br>

<div id="multi-language-popup-search-no-normalize-select"></div> <span style="font-size: .8rem; margin-left: 5px;">Popup - searchNormalize: false</span>

```js
VirtualSelect.init({
  ele: '#multi-language-popup-search-select',
  options: multiLanguageOptions,
  search: true,
  hasOptionDescription: true,
  popupDropboxBreakpoint: '3000px',
  searchNormalize: true,
});

VirtualSelect.init({
  ele: '#multi-language-popup-search-no-normalize-select',
  options: multiLanguageOptions,
  search: true,
  hasOptionDescription: true,
  popupDropboxBreakpoint: '3000px',
  searchNormalize: false,
});
```

> **Note on Thai and Japanese hiragana**: stripping combining marks affects Thai vowel signs (e.g. `สวัสดี` → `สวสด`) and Japanese hiragana voicing marks (e.g. `が` → `か`). This enables fuzzy matching but loses some semantic precision. Use `searchNormalize: false` if exact-match behavior is required for those scripts.

## Show dropbox as popup

Show dropbox as popup on small screens like mobile.

For demo purpose I have enabled popup for large screens by setting `popupDropboxBreakpoint: '3000px'`

So that you can check below dropdown in large screens also.

<div id="multiple-show-as-popup-select"></div>

<br>
<br>

<div id="single-show-as-popup-select"></div>

## Server search

Get options from server on search

<div id="server-search-select"></div>

```js
VirtualSelect.init({
  ...
  onServerSearch: onSampleSelectServerSearch,
});

function onSampleSelectServerSearch(searchValue, virtualSelect) {
  /** project developer has to define anyMehodToGetDataFromServer function to make API call */
  anyMehodToGetDataFromServer(searchValue).then(function(newOptions) {
    virtualSelect.setServerOptions(newOptions);
  });
}
```

## Show options only on search

<div id="options-on-search-select"></div>

```js
VirtualSelect.init({
  ...
  showOptionsOnlyOnSearch: true,
});
```

## Add image/icon

Use `labelRenderer` callback function to add image, icon, or custom content to items
Use `selectedLabelRenderer` callback function to add image, icon, or custom content to selected item

<div id="with-image-select"></div>

```js
VirtualSelect.init({
  ...
  labelRenderer: sampleLabelRenderer,
  selectedLabelRenderer: sampleLabelRenderer
});

function sampleLabelRenderer(data) {
  let prefix = '';

  /** skipping options those are added newly by allowNewOption feature */
  if (!data.isCurrentNew && !data.isNew) {
    /** project developer has to add their own logic to create image/icon tag */
    let flagIndex = data.value % flagClasses.length;
    prefix = `<i class="flag flag-${flagClasses[flagIndex]}"></i>`;
  } else {
    /** common image/icon could be added for new options */
  }

  return `${prefix}${data.label}`;
}
```

## Show values as tags

Show each selected values as tags with remove icon

<div id="show-value-as-tags-select"></div>

Show each selected values as tags with some containing HTML

<div id="show-value-as-tags-select-with-html"></div>

```js
VirtualSelect.init({
  ...
  showValueAsTags: true,
});
```

## Right-to-Left text

For right-to-left text direction languages

<div id="direction-rtl-select"></div>

```js
VirtualSelect.init({
  ...
  textDirection: 'rtl',
});
```

## Disable/Enable

Switch dropdown state element programmatically

<div id="disable-enable"></div>
<label><input type=checkbox id=disable-enable-switch checked> Enable</label>

```js
document.querySelector('#disable-enable-switch').addEventListener('change', function (e) {
  if (e.target.checked) {
    document.querySelector('#sample-select').enable();
  } else {
    document.querySelector('#sample-select').disable();
  }
});
```

## Validation

<form id="validation-form">
  <div id="validation-select"></div>

  <div>
    <button class="btn" type="reset">Reset</button>
    <button class="btn" type="submit">Submit</button>
  </div>
</form>

```js
VirtualSelect.init({
  ...
  required: true,
});

/** To validate a single dropdown */
document.querySelector('#sample-select').validate();

/** To validate all dropdowns on form submit */
document.querySelector('#sample-form').addEventListener('submit', function() {
  if (VirtualSelect.validate(this)) {
    alert('Form submitted');
  }
});
```

## Custom styling

Use `additionalClasses`, `additionalDropboxClasses`, `additionalDropboxContainerClasses` and `additionalToggleButtonClasses` to customize the styling of your dropdown

<div id="custom-styling-select"></div>

```js
VirtualSelect.init({
  ...
  additionalClasses: 'custom-wrapper',
  additionalDropboxClasses: 'custom-dropbox',
  additionalDropboxContainerClasses: 'custom-dropbox-container',
  additionalToggleButtonClasses: 'custom-toggle-button',
});
```


<!-- END -->
<script>
  setTimeout(function() {
    initPageExamples();
  }, 0);
</script>
