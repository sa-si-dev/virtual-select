# Events

### On change

Change event would be trigged on choosing option

<div id="select-onchange"></div>
<div id="select-onchange-results"></div>

```js
initVirtualSelect({
  ele: '#select-onchange',
  ...
});

/** in vanilla javascript */
document.querySelector('#select-onchange').addEventListener('change', function() {
  document.querySelector('#select-onchange-results').innerText = `value = ${this.value}`;
});

/** in jquery */
$('#select-onchange').change(function() {
  $('#select-onchange-results').innerText = `value = ${this.value}`;
});
```

### Open / Close

```js
/** in vanilla javascript */
document.querySelector('#sample-select').addEventListener('beforeOpen', callbackFunction);
document.querySelector('#sample-select').addEventListener('afterOpen', callbackFunction);

/** in jquery */
$('#sample-select').on('beforeClose', callbackFunction);
$('#sample-select').on('afterClose', callbackFunction);
```

### Reset

This event would be triggered when clear button is clicked or form is reset.

```js
/** in vanilla javascript */
document.querySelector('#sample-select').addEventListener('reset', callbackFunction);

/** in jquery */
$('#sample-select').on('reset', callbackFunction);
```


<!-- END -->
<script>
  setTimeout(function() {
    initPageEvents();
  }, 0);
</script>
