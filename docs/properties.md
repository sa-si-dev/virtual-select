# Properties

| Name | Type | Default value | Description |
| --- | --- | --- | ---- |
| ele | String \| Element | | DOM element to initialize plugin<br/>String - #sample-select <br/>Element - document.querySelector('#sample-select') |
| options | Array | [] | List of options <br/>[<br/>  { label: 'Option 1', value: '1' }, <br/>  { label: 'Option 2', value: '2' }<br/>  ...<br/>] |
| options[].alias | String \| Array | | Alternative labels to use on search.<br/>Array of string or comma separated string. |
| options[].options | Array | | List of options for option group |
| labelKey | String | label | Object key to use to get label from options array |
| valueKey | String | value | Object key to use to get value from options array |
| aliasKey | String | alias | Object key to use to get alias from options array |
| disabledOptions | Array | [] | List of values to disable options <br/>e.g - [2, 3, 9] |
| multiple | Boolean | false | Enable multi-select |
| search | Boolean | false - for single select <br/>true - for multi-select | Enable search feature |
| hideClearButton | Boolean | false | Hide clear value button |
| disableSelectAll | Boolean | false | Disable select all feature of multiple select |
| optionsCount | Number | 5 | No.of options to show on viewport |
| optionHeight | String | 40px | Height of each dropdown options |
| position | String | auto | Position of dropbox (top, bottom, auto) |
| placeholder | String | Select | Text to show when no options selected |
| noOptionsText | String | No options found | Text to show when no options to show |
| noSearchResultsText | String | No results found | Text to show when no results on search |
| selectedValue | String \| Array | | Single value or array of values to select on init |
| silentInitialValueSet | Boolean | false | To avoid "change event" trigger on setting initial value |
| dropboxWidth | String | | Custom width for dropbox |
| zIndex | Number | 1 | CSS z-index value for dropbox |
| noOfDisplayValues | Number | 50 | Maximum no.of values to show in the tooltip for multi-select |
| allowNewOption | Boolean | false | Allow to add new option by searching |
| tooltipFontSize | String | 14px | Font size for tooltip |
| tooltipAlignment | String | center | CSS Text alignment for tooltip |
| tooltipMaxWidth | String | 300px | CSS max width for tooltip |
| showSelectedOptionsFirst | Boolean | false | Show selected options at the top of the dropbox |
| markSearchResults | Boolean | false | Mark matched term in label |
| hiddenInputName | String | | Name attribute for hidden input<br>It would be useful for form submit to server |
| keepAlwaysOpen | Boolean | false | Keep dropbox always open with fixed height |
| maxValues | Number | 0 | Maximum no.of options allowed to choose in multiple select<br>0 - for no limit |

## Using properties on initialization

```js
VirtualSelect.init({
  ...
  valueKey: 'id',
  search: true,
  ...
});
```


## Using properties as DOM attributes

To use an property as an attribute, property name should be `hyphenated` and prefixed with `data-*` (e.g. `noOptionsText` => `data-no-options-text`)

```html
<div id="sample-select"
  multiple
  placeholder="Select country"
  data-value-key="id"
  data-search="true"
></div>
```

<br>

**Following properties are not allowed to use as attribute**
- ele
- options
- disabledOptions
- selectedValue

<br>

**Following properties should be used without `data-*` as prefix**
- multiple
- placeholder