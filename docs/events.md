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