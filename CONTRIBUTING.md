# How To Contribute

## Installation

- `git clone <repository-url>`
- `cd event-perk-grid`
- `yarn install`

## Linting

- `yarn run lint`
- `yarn run lint:fix`

## Testing

See test-setup.ts for information about useful test setup hooks.

### Test Server

- `yarn start` - Runs the test suite in "watch mode" using a webpack dev server

### Testem

- `yarn test` – Runs the test suite

## The Build

<!-- FIXME -->

what is the public api

script/bundle - single file
es modules - roughly equivalent to a file

### commonjs

defacto node module format: require, module.exports = { named: () => {} } or module.exports = default

```js
module.exports = default;
module.exports.named = otherthing;

const exports = {
  'file-name': default
}

const thing = require('file-name')
const { namedThing } = thing;
```

### amd/umd

advanced IIFE system
`window.define` = global function

```ts
window.define = function (
  moduleName: string,
  dependencies: string[],
  module: () => {}
) {};

window.require = function (moduleName: string): Record<string, unknown> {};
```

### es modules

previous attempts at module-ification were hacks using existing JS features, but TS39 can change the language
standardizes how people write modules by providing a standard syntax

TODOs:

1. standardize the authoring syntax

2.75. where we are today. you can write stuff using es modules, but you have to transpile it to something else

2. every runtime should use the same module syntax

### our lib

```plain
dist/index.js: re-exports render and fetch-data, ok if bundled
dist/**/*.d.ts: whatever

dist/custom-element.js <--upkg points to this, imports render and fetch-data and uses it
```

```plain
dist: modules
dist/browser: custom-element.js bundle (registers the custom element)
```

## Publishing

```shell
yarn login
yarn version
```
