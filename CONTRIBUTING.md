# How To Contribute

## TODOS:

- [ ] accessibility
- [ ] Verify CORs settings

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
git commit
git push
yarn login
yarn publish
# now check to make sure the published package works
git push
git push --tags
```

## Running docs server in dev

Tab 1: Run the build in watch mode so that docs examples are guaranteed to be running the latest versions of the library.
(Note: This doesn't apply to the script tag example)

```shell
yarn build --watch
```

Tab 2: Run the docs command in watch mode so that the docs app will have the latest typedoc information.

```shell
yarn docs --watch
```

Tab 3: Start the Ember server.

```shell
cd docs && yarn start
```

Visit http://localhost:4200/

## Deploying docs

```shell
yarn docs:deploy
```
