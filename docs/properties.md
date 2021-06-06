# Properties

| Name | Type | Default value | Description |
| --- | --- | --- | ---- |
| ele | String \| Element | | DOM element to initialize plugin<br/>String - #sample-select <br/>Element - document.querySelector('#sample-select') |
| options | Array | [] | List of options <br/>[<br/>  { label: 'Option 1', value: '1' }, <br/>  { label: 'Option 2', value: '2' }<br/>  ...<br/>] |
| options[].alias | String \| Array | | Alternative labels to use on search.<br/>Array of string or comma separated string. |
| options[].options | Array | | List of options for option group |
| options[].description | String | | Text to show along with label |
| valueKey | String | value | Object key to use to get value from options array |
| labelKey | String | label | Object key to use to get label from options array |
| descriptionKey | String | description | Object key to use to get description from options array |
| aliasKey | String | alias | Object key to use to get alias from options array |
| disabledOptions | Array | [] | List of values to disable options <br/>e.g - [2, 3, 9] |
| multiple | Boolean | false | Enable multi-select |
| search | Boolean | false - for single select <br/>true - for multi-select | Enable search feature |
| hideClearButton | Boolean | false | Hide clear value button |
| autoSelectFirstOption | Boolean | false | Select first option by default on load |
| hasOptionDescription | Boolean | false | Has description to show along with label |
| disableSelectAll | Boolean | false | Disable select all feature of multiple select |
| optionsCount | Number | 5 \| 4 | No.of options to show on viewport <br/>4 - When hasOptionDescription is true |
| optionHeight | String | 40px \| 50px | Height of each dropdown options <br/>50px - When hasOptionDescription is true |
| position | String | auto | Position of dropbox (top, bottom, auto) |
| placeholder | String | Select | Text to show when no options selected |
| noOptionsText | String | No options found | Text to show when no options to show |
| noSearchResultsText | String | No results found | Text to show when no results on search |
| selectAllText | String | Select all | Text to show near select all checkbox when search is disabled |
| searchPlaceholderText | String | Search... | Text to show as placeholder for search input |
| clearButtonText | String | Clear | Tooltip text for clear button |
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
| name | String | | Name attribute for hidden input<br>It would be useful for form submit to server |
| keepAlwaysOpen | Boolean | false | Keep dropbox always open with fixed height |
| maxValues | Number | 0 | Maximum no.of options allowed to choose in multiple select<br>0 - for no limit |
| additionalClasses | String | | Additional classes for wrapper element |
| showDropboxAsPopup | Boolean | true | Show dropbox as popup on small screen like mobile |
| popupDropboxBreakpoint | String | 576px | Maximum screen width that allowed to show dropbox as popup |
| onServerSearch | Function | | Callback function to integrate server search |
| labelRenderer | Function | | Callback function to render label, which could be used to add image, icon, or custom content |
| hideValueTooltipOnSelectAll | Boolean | true | Hide value tooltip if all options selected |
| showOptionsOnlyOnSearch | Boolean | false | Show options to select only if search value is not empty |
| selectAllOnlyVisible | Boolean | false | Select only visible options on clicking select all checkbox when options filtered by search |

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
- onServerSearch
- labelRenderer

<br>

**Following properties should be used without `data-*` as prefix**
- multiple
- placeholder
- name
