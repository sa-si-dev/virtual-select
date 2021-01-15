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

## Hide clear button

<div id="hide-clear-select"></div>

```js
VirtualSelect.init({
  ...
  hideClearButton: true,
});
```

<script>
  initPageExamples();
</script>