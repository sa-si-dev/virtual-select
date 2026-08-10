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
- [VirtualSelect.setGlobalDefaults()](#virtualselectsetglobaldefaults)

### Get selected value

```js
document.querySelector('#sample-select').value;
/* or */
$('#sample-select').val();
```

### setValue()

**Arguments:**

- value - single value or array of values
- disableEvent - set `true` to avoid event trigger
- disableValidation - set `true` to disable the validation

```js
var value = 3; /** for single select */
var value = [2, 3]; /** for multi-select */

document.querySelector('#sample-select').setValue(value);
```

### reset()

**Arguments:**

- formReset - set `true` to disable validations 
- disableChangeEvent - set `true` disable the change event

```js
document.querySelector('#sample-select').reset();
```

### setOptions()

**Arguments:**

- options - list of options details
- keepValue - set `true` to keep selected value

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
- keepValue - set `true` to keep selected value

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

### VirtualSelect.setGlobalDefaults()

Set default props applied to every instance created afterwards, so a page-wide policy does not
have to be repeated at each call site.

The main use is security. Option `label` and `description` are inserted as raw HTML and are only
escaped when `enableSecureText` is on, which is **not** the default (escaping runs per option and
is measurable on 10k-100k+ lists). `value` is never rendered as HTML - it is only compared and
written to a `data-value` attribute, which is escaped at that boundary - so it stays exactly as
you supplied it. If any option text in your app can come from untrusted input, turn escaping on
once during startup:

```js
VirtualSelect.setGlobalDefaults({ enableSecureText: true });
```

Notes:

- These are **defaults, not overrides**. An instance that passes the prop explicitly still wins,
  so if your wrapper forwards `enableSecureText` on every `init()` call it must stop doing so (or
  forward `true`) for the global to take effect.
- Only instances created **after** the call are affected. Call it before initialising dropdowns.
- Calls **merge**, so unrelated settings can be configured separately.
- `ele` and `options` are ignored, being inherently per-instance.
- A non-object argument (e.g. an accidentally-unset variable) is **ignored**, so a page-wide
  policy cannot be wiped by mistake. To clear a single key, pass it with the value `undefined`;
  to clear everything, call [`VirtualSelect.resetGlobalDefaults()`](#virtualselectresetglobaldefaults).

### VirtualSelect.resetGlobalDefaults()

Drop every global default, so instances created afterwards fall back to the library's own
defaults. Clearing is deliberately a separate method: `setGlobalDefaults()` only ever merges, so
passing it `{}` does nothing.

```js
VirtualSelect.resetGlobalDefaults();
```

### VirtualSelect.getGlobalDefaults()

Read the global defaults currently in force, as set by
[`setGlobalDefaults()`](#virtualselectsetglobaldefaults). Returns a shallow copy, so writing to
the returned object does not change what later instances get.

```js
VirtualSelect.getGlobalDefaults();
```
