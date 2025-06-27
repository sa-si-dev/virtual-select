# Events

### On change

Change event would be trigged on choosing option

<div id="sample-select-onchange"></div>
<div id="sample-select-changes" aria-live="polite">Selected = - | No.changes = -</div>

```js
/** in vanilla javascript */
document.querySelector('#sample-select-onchange').addEventListener('change', function() {
  document.querySelector('#sample-select-changes').innerText = `Selected = ${this.value}`;
});

/** in jquery */
$('#sample-select-onchange').change(function() {
  $('#sample-select-changes').innerText = `Selected = ${this.value}`;
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
