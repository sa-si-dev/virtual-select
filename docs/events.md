# Events

### On change

This event will be triggered when choosing an option from the dropdown.

<div class="flex-container">
  <div id="sample-select-onchange"></div>
  <div id="sample-select-changes" class="sample-select-results" aria-live="polite">Selected = - | No.changes = -</div>
</div>

```js
/** in vanilla javascript */
document.querySelector('#sample-select-onchange').addEventListener('change', function() {
  document.querySelector('#sample-select-changes').textContent = `Selected = ${this.value}`;
});

/** in jquery */
$('#sample-select-onchange').change(function() {
  $('#sample-select-changes').textContent = `Selected = ${this.value}`;
});
```

### Open / Close

These events will be triggered when opening or closing the dropdown.

<div class="flex-container">
  <div id="sample-select-openclose"></div>
  <div id="select-openclose-res" class="sample-select-results" aria-live="polite"></div>
</div>

```js
/** in vanilla javascript */
document.querySelector('#sample-select-openclose').addEventListener('beforeOpen', callbackFunction);
document.querySelector('#sample-select-openclose').addEventListener('afterOpen', callbackFunction);
document.querySelector('#sample-select-openclose').addEventListener('beforeClose', callbackFunction);
document.querySelector('#sample-select-openclose').addEventListener('afterClose', callbackFunction);

/** in jquery */
$('#sample-select-openclose').on('beforeOpen', callbackFunction);
$('#sample-select-openclose').on('afterOpen', callbackFunction);
$('#sample-select-openclose').on('beforeClose', callbackFunction);
$('#sample-select-openclose').on('afterClose', callbackFunction);
```

### Reset

This event will be triggered when clear button is clicked or a form is reset.

<div class="flex-container">
  <div id="sample-select-reset"></div>
  <div id="select-reset-res" class="sample-select-results" aria-live="polite"></div>
</div>

```js
/** in vanilla javascript */
document.querySelector('#sample-select-reset').addEventListener('reset', callbackFunction);

/** in jquery */
$('#sample-select-reset').on('reset', callbackFunction);
```


<!-- END -->
<script>
  setTimeout(function() {
    initPageEvents();
  }, 0);
</script>
