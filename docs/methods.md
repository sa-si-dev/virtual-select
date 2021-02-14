# Methods

- [Get selected value](#get-selected-value)
- [reset()](#reset)
- [setValue()](#setoptions)
- [setOptions()](#setvalue)
- [setDisabledOptions()](#setdisabledoptions)
- [toggleSelectAll()](#toggleselectall)
- [isAllSelected()](#isallselected)
- [addOption()](#addoption)
- [getNewValue()](#getnewvalue)
- [getDisplayValue()](#getdisplayvalue)

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

### addOption()

To add a new option with existing options

```js
document.querySelector('#sample-select').addOption({
  value: '101',
  label: 'Option 101',
});
```

### getNewValue()

Get selected value which is added as [new option](https://sa-si-dev.github.io/virtual-select/#/examples?id=allow-to-add-new-option)

```js
document.querySelector('#sample-select').getNewValue();
```

### getDisplayValue()

Get selected option's display value (i.e label)

```js
document.querySelector('#sample-select').getDisplayValue();
```