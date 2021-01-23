# Properties

| Name | Type | Default value | Description |
| --- | --- | --- | ---- |
| ele | String \| Element | | DOM element to initialize plugin<br/>String - #sample-select <br/>Element - document.querySelector('#sample-select') |
| options | Array | [] | List of options <br/>[<br/>  { label: 'Option 1', value: '1' }, <br/>  { label: 'Option 2', value: '2' }<br/>  ...<br/>] |
| labelKey | String | label | Object key to use to get label from options array |
| valueKey | String | value | Object key to use to get value from options array |
| disabledOptions | Array | [] | List of values to disable options <br/>e.g - [2, 3, 9] |
| multiple | Boolean | false | Enable multi-select |
| search | Boolean | false - for single select <br/>true - for multi-select | Enable search feature |
| hideClearButton | Boolean | false | Hide clear value button |
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
