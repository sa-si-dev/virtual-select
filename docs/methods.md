# Methods

- [Get selected value](#get-selected-value)
- [setValue()](#setvalue)
- [reset()](#reset)
- [setOptions()](#setoptions)
- [setDisabledOptions()](#setdisabledoptions)
- [setEnabledOptions()](#setenabledoptions)
- [toggleSelectAll()](#toggleselectall)
- [isAllSelected()](#isallselected)
- [addOption()](#addoption)
- [getNewValue()](#getnewvalue)
- [getDisplayValue()](#getdisplayvalue)
- [getSelectedOptions()](#getselectedoptions)
- [getDisabledOptions()](#getdisabledoptions)
- [open()](#open)
- [close()](#close)
- [focus()](#focus)
- [enable()](#enable)
- [disable()](#disable)
- [destroy()](#destroy)
- [setServerOptions()](#setserveroptions)
- [validate()](#validate)
- [toggleRequired()](#togglerequired)

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

- disabledOptions - list of disabled option's values or `true` to disable all options
- keepValue - set true to keep selected value

```js
var disabledOptions = [2, 6, 9];

document.querySelector('#sample-select').setDisabledOptions(disabledOptions);

/** to disable all options */
document.querySelector('#sample-select').setDisabledOptions(true);
```

### setEnabledOptions()

**Arguments:**

- enabledOptions - list of enabled option's values or `true` to enable all options
- keepValue - set true to keep selected value

```js
var enabledOptions = [2, 6, 9];

document.querySelector('#sample-select').setEnabledOptions(enabledOptions);

/** to enable all options */
document.querySelector('#sample-select').setEnabledOptions(true);
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

### getDisabledOptions()

Get disabled option's details.

```js
document.querySelector('#sample-select').getDisabledOptions();
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

### focus()

To focus dropdown element programmatically

```js
document.querySelector('#sample-select').focus();
```

### enable()

To enable dropdown element programmatically

```js
document.querySelector('#sample-select').enable();
```

### disable()

To disable dropdown element programmatically

```js
document.querySelector('#sample-select').disable();
```

### destroy()

To destroy the virtual select instance from the element

```js
document.querySelector('#sample-select').destroy();
```

### setServerOptions()

Use this method to set options while loading options from server.

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

### validate()

To trigger required validation programmatically

```js
/** To validate a single dropdown */
document.querySelector('#sample-select').validate();

/** To validate all dropdowns inside a form or form container */
VirtualSelect.validate(document.querySelector('#sample-form'));
VirtualSelect.validate(document.querySelector('#feedback-container'));
```

### toggleRequired()

To update required property value

**Arguments:**

- isRequired - true/false

```js
document.querySelector('#sample-select').toggleRequired(true);
```
