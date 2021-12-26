# Get Started

In a website DOM manipulation is expensive. If we try to render thousands of options to choose from in a dropdown, it would affect the performance and slow down the website.

To fix this problem, I have used the virtual scrolling concept to render dropdown options.

As you can see in the below examples, each dropdown has 100000 options. But you won't feel any slowness while interacting with it.

<div class="get-started-example">
  <div id="single-select"></div>
  <div id="multiple-select"></div>
</div>

## Download files
You can download the required CSS and JS files from the `dist` directory in the [GitHub repository](https://github.com/{{repo}})

OR from below direct links

[virtual-select.min.css](https://raw.githubusercontent.com/{{repo}}/master/dist/virtual-select.min.css)

[virtual-select.min.js](https://raw.githubusercontent.com/{{repo}}/master/dist/virtual-select.min.js)

[tooltip.min.css](https://raw.githubusercontent.com/sa-si-dev/tooltip/master/dist/tooltip.min.css)

[tooltip.min.js](https://raw.githubusercontent.com/sa-si-dev/tooltip/master/dist/tooltip.min.js)


## Import files

Import downloaded files (`virtual-select.min.css` and `virtual-select.min.js`) into your project.

```html
<link rel="stylesheet" href="path/to/virtual-select.min.css">

<script src="path/to/virtual-select.min.js">
```

Import below files to enable optional tooltip plugin.\
Tooltip would be used to show selected values and options text, if text is long and hidden by ellipsis.
```html
<link rel="stylesheet" href="path/to/tooltip.min.css">

<script src="path/to/tooltip.min.js">
```

If you want to use tooltip plug-in in your project, refer [Tooltip Documentation](https://sa-si-dev.github.io/tooltip)

## Install from NPM

We could install this plugin from NPM and use it

```shell
npm install --save virtual-select-plugin
```

## Import files from node_modules

```html
<link rel="stylesheet" href="node_modules/virtual-select-plugin/dist/virtual-select.min.css">
<script src="node_modules/virtual-select-plugin/dist/virtual-select.min.js"></script>

<!-- optional -->
<link rel="stylesheet" href="node_modules/tooltip-plugin/dist/tooltip.min.css">
<script src="node_modules/tooltip-plugin/dist/tooltip.min.js"></script>
```

## Initialize plugin

```html
<div id="sample-select"></div>
```

```js
VirtualSelect.init({
  ele: '#sample-select',
  options: [
    { label: 'Options 1', value: '1' },
    { label: 'Options 2', value: '2' },
    { label: 'Options 3', value: '3' },
  ],
});
```

## Initialize from native select element (not recommended)

Not recommended to use native element to initiate the plugin when no.of options is more, since it might affect the performance.

```html
<select multiple
  name="native-select" placeholder="Native Select"
  data-search="false" data-silent-initial-value-set="true"
>
  <option value="1" disabled>Option 1</option>
  <option value="2">Option 2</option>
  <option value="3" selected>Option 3</option>
  <option value="4" selected>Option 4</option>
  <option value="5">Option 5</option>
  <option value="6">Option 6</option>
</select>
```

```js
VirtualSelect.init({ ele: 'select' });
```

<script>
  initPageGetStarted();
</script>