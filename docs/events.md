# Events

### On change

Change event would be trigged on choosing option

```js
/** in vanilla javascript */
document.querySelector('#sample-select').addEventListener('change', function() {
  console.log(this.value);
});

/** in jquery */
$('#sample-select').change(function() {
  console.log(this.value);
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
