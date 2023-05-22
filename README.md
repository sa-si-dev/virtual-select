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
<link rel="stylesheet" href="node_modules/tooltip-plugin/dist/tooltip.min.css">
<script src="node_modules/tooltip-plugin/dist/tooltip.min.js"></script>
```

## New release steps
### Create build
- `npm run build`
- It would update files in `dist`, `dist-archive`, and `docs/assets` folders

### Test build
- `npm run validate` for static code validation
- `npm run test` for cypress e2e testing

### Create release
- Release tag would be `v1.0.(LAST_RELEASE_NUMBER + 1)`. E.g. `v1.0.30`
- Content should be based on [keepachangelog.com](https://keepachangelog.com/en/1.0.0/) format
- Line item format
  - `#ISSUE_ID - DESCRIPTION (PR #ID by @user)`
