# Examples

- [Default dropdown](#default-dropdown)
- [With search box](#with-search-box)
- [Multiple select](#multiple-select)
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

<script>
  initPageExamples();
</script>