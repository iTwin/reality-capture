# Contributing

`@itwin/reality-data-client` is deprecated and is maintained only for approved critical fixes.

New features are not accepted. Before starting work, contact the project maintainers to confirm that a security, compatibility, or critical defect fix is in scope.

## Validating an Approved Fix

Run the following commands from the `typescript/packages/reality-data-client` directory before submitting an approved fix:

```sh
```sh
pnpm install
pnpm build
pnpm lint
pnpm test:unit
```

Create a release change file with `pnpm change` only when a maintainer requests a package release.