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
- [Show dropbox as popup](#show-dropbox-as-popup)
- [Server search](#server-search)
- [Show options only on search](#show-options-only-on-search)
- [Add image/icon](#add-imageicon)
- [Show values as tags](#show-values-as-tags)
- [Right-to-Left text](#right-to-left-text)
- [Disable/Enable](#disable-enable)
- [Validation](#validation)

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

Use `labelRenderer` callback function to add image, icon, or custom content

<div id="with-image-select"></div>

```js
VirtualSelect.init({
  ...
  labelRenderer: sampleLabelRenderer,
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

<script>
  setTimeout(function() {
    initPageExamples();
  }, 0);
</script>
