# Methods

### Get selected value

```js
document.querySelector('#sample-select').value;
/* or */
$('#sample-select').val();
```

### setValue()

```js
var value = 3; /** for single select */
var value = [2, 3]; /** for multi-select */

document.querySelector('#sample-select').setValue(value);
```

### reset()

```js
document.querySelector('#sample-select').reset();
```

### setOptions()

```js
var options = [
  { label: 'Options 1', value: '1' },
  { label: 'Options 2', value: '2' },
  { label: 'Options 3', value: '3' },
];

document.querySelector('#sample-select').setOptions(options);
```

### setDisabledOptions()

```js
var disabledOptions = [2, 6, 9];

document.querySelector('#sample-select').setDisabledOptions(disabledOptions);
```

### toggleSelectAll()

Select / Deselect all options

```js
/** select all options */
document.querySelector('#sample-select').toggleSelectAll(true);

/** deselect all options */
document.querySelector('#sample-select').toggleSelectAll(false);
```

### isAllSelected()

To check that if all options selected or not

```js
document.querySelector('#sample-select').isAllSelected();
```