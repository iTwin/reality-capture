# Contributing

`@itwin/reality-data-client` is deprecated and is maintained only for approved critical fixes.

New features are not accepted. Before starting work, contact the project maintainers to confirm that a security, compatibility, or critical defect fix is in scope.

## Validating an Approved Fix

Run the following commands from the `typescript/packages/reality-data-client` directory before submitting an approved fix:

```sh
pnpm install
pnpm build
pnpm lint
pnpm test:unit
```

## Release Changes

Every approved fix must include a changeset. Create one from the `typescript/packages/reality-data-client` directory:

```sh
pnpm change
```

Follow the prompts to select the version bump and write the release note. Commit the generated `.changeset/*.md` file with the pull request. Run `pnpm check` to verify that a changeset is present.

Pull requests targeting `main` or `upcoming/*` are checked automatically: if they modify this package without adding a changeset, a reminder comment is posted on the pull request.