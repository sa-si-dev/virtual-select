# Virtual Select Plugin

> A javascript plugin for dropdown with virtual scroll

- Support more than 100000 dropdown options
- Support multi-select
- Support search feature
- Support Right-to-Left text
- Support loading options from server (API)

[Documentation](https://sa-si-dev.github.io/virtual-select)

[Changelog](https://github.com/sa-si-dev/virtual-select/releases)

## Install

```shell
npm install --save virtual-select-plugin
```

## Import files

```html
<link rel="stylesheet" href="node_modules/virtual-select-plugin/dist/virtual-select.min.css">
<script src="node_modules/virtual-select-plugin/dist/virtual-select.min.js"></script>

<!-- optional -->
<link rel="stylesheet" href="node_modules/virtual-select-plugin/dist/virtual-select-tooltip.min.css">
<script src="node_modules/virtual-select-plugin/dist/virtual-select-tooltip.min.js"></script>
```

> **Upgrading from 1.4.x:** `tooltip-plugin` is no longer installed with Virtual Select, so `node_modules/tooltip-plugin/dist/tooltip.min.js` stops loading. Switch to the two `virtual-select-tooltip` files above, or add `tooltip-plugin` to your own dependencies. See [Get Started](https://sa-si-dev.github.io/virtual-select/#/get-started) for details.
