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

## Publishing

```shell
yarn login
yarn version
yarn publish
```
