# Methods

- [Get selected value](#get-selected-value)
- [setValue()](#setvalue)
- [reset()](#reset)
- [Disable element](#disable-element)
- [setOptions()](#setoptions)
- [setDisabledOptions()](#setdisabledoptions)
- [toggleSelectAll()](#toggleselectall)
- [isAllSelected()](#isallselected)
- [addOption()](#addoption)
- [getNewValue()](#getnewvalue)
- [getDisplayValue()](#getdisplayvalue)
- [getSelectedOptions()](#getselectedoptions)
- [open()](#open)
- [close()](#close)
- [destroy()](#destroy)

### Get selected value

```js
document.querySelector('#sample-select').value;
/* or */
$('#sample-select').val();
```

### setValue()

**Arguments:**

- value - single value or array of values
- noEventTrigger - set true to avoid event trigger

```js
var value = 3; /** for single select */
var value = [2, 3]; /** for multi-select */

document.querySelector('#sample-select').setValue(value);
```

### reset()

```js
document.querySelector('#sample-select').reset();
```

### Disable element

```js
/** disable element */
document.querySelector('#sample-select').setAttribute('disabled', '');

/** enable element */
document.querySelector('#sample-select').removeAttribute('disabled');
```

### setOptions()

**Arguments:**

- options - list of options details
- keepValue - set true to keep selected value

```js
var options = [
  { label: 'Options 1', value: '1' },
  { label: 'Options 2', value: '2' },
  { label: 'Options 3', value: '3' },
];

document.querySelector('#sample-select').setOptions(options);
```

### setDisabledOptions()

**Arguments:**

- disabledOptions - list of disabled option's values
- keepValue - set true to keep selected value

```js
var disabledOptions = [2, 6, 9];

document.querySelector('#sample-select').setDisabledOptions(disabledOptions);
```

### toggleSelectAll()

**Arguments:**

- isAllSelected

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

**Arguments:**

- optionDetails

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

### getSelectedOptions()

Get selected option's details.
It would contains `isNew: true` property for options added newly by `allowNewOption`

```js
document.querySelector('#sample-select').getSelectedOptions();
```

### open()

To open dropbox programmatically

```js
document.querySelector('#sample-select').open();
```

### close()

To close dropbox programmatically

```js
document.querySelector('#sample-select').close();
```

### destroy()

To destroy the virtual select instance from the element

```js
document.querySelector('#sample-select').destroy();
```
