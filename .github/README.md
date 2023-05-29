# Virtual Select <small>1.0</small>

> A javascript plugin for dropdown with virtual scroll

- Support more than 100000 dropdown options
- Support multi-select
- Support search feature
- Support Right-to-Left text
- Support loading options from server (API)

[Documentation](https://sa-si-dev.github.io/virtual-select)

[Changelog](https://github.com/sa-si-dev/virtual-select/releases)

## Commands

| Command          | Description                                           |
| ---------------- | ----------------------------------------------------- |
| npm run start    | Builds dist versions of the plugin on file change     |
| npm run build    | Builds dist versions of the plugin                    |
| npm run docs     | Starts a local documentation server                   |
| npm run validate | Code validation with Typescript, ESLint and Stylelint |
| npm run test     | Run cypress e2e testing                               |

## Pull request

- Don't commit build files in PR commit. It should be generated before new release only.

## New release steps

### Create build

- Update version in `package.json` file. Version number would be `1.0.(LAST_RELEASE_NUMBER + 1)`. E.g. `1.0.30`
- Run `npm run build`
- It would update files in `dist`, `dist-archive`, and `docs/assets` folders

### Test build

- `npm run validate` for static code validation
- `npm run test` for cypress e2e testing

### Create release

- Release tag would be `v1.0.(SAME_NUMBER_FROM_PACKAGE_JSON)`. E.g. `v1.0.30`
- Content should be based on [keepachangelog.com](https://keepachangelog.com/en/1.0.0/) format
- Line item format
  - `#ISSUE_ID - DESCRIPTION (PR #ID by @user)`
