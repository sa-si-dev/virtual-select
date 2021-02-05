# Examples

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

<div id="mark-results-select"></div>

```js
VirtualSelect.init({
  ...
  search: true,
  markSearchResults: true,
});
```

<script>
  initPageExamples();
</script>