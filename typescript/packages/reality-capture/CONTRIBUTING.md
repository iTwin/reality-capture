# Contributing

Thank you for your interest in contributing! There are several ways you can help.

Please take a read through this document to help streamline the process of getting your contributions added.

## Table of Contents

- [Contributing](#contributing)
  - [Table of Contents](#table-of-contents)
  - [Source Code Edit Workflow](#source-code-edit-workflow)
    - [Pre-reqs](#prerequisites)
    - [Build](#build)
    - [Unit tests](#unit-tests)
    - [ESLint](#eslint)
    - [Release Changes](#release-changes)
    - [Before Submitting a Pull Request](#before-submitting-a-pull-request)

## Source Code Edit Workflow

Run the commands in this guide from the `typescript/packages/reality-capture` directory.

### Prerequisites

To build and run the source code locally you will need a few things:

- Install [Node.js](https://nodejs.org/en/) 22 or later.
- Install pnpm.
- Install [VS Code](https://code.visualstudio.com/) (optional).

### Build

To build the reality-capture locally, open a new terminal in the current location and run the following commands :

- Install dependencies

  ```sh
  pnpm install
  ```

- Build the project

  ```sh
  pnpm build
  ```

### Unit tests

Run the unit tests during development:

- Run unit tests

  ```sh
  pnpm test:unit
  ```

Verify coverage before submitting a pull request:

- Run unit tests with coverage

  ```sh
  pnpm coverage
  ```

This command runs the unit tests, generates text and HTML coverage reports, and requires each applicable source file to reach at least 90% coverage for lines, statements, and functions.

### ESLint

Run the following command to check that the source code complies with the ESLint rules:

- Run ESLint

  ```sh
  pnpm lint
  ```

To apply available ESLint fixes automatically, run:

```sh
pnpm lint-fix
```

Run `pnpm lint` again afterward to verify that no issues remain.

### Release Changes

For changes that affect the published package, create a changeset from this directory:

```sh
pnpm change
```

Follow the prompts to select the version bump and write the release note. Commit the generated `.changeset/*.md` file with the pull request. To verify that a changeset is present, run `pnpm check` with the branch your pull request targets (`main`, `upcoming/ITCM` or `upcoming/ITME`):

```sh
pnpm check --since=origin/upcoming/ITCM
```

Without `--since`, the command compares against `main` and counts every changeset already in the folder, so it can pass even if your branch did not add one.

Pull requests targeting `main` or `upcoming/*` are checked automatically: if they modify this package without adding a changeset, a reminder comment is posted on the pull request.

### Before Submitting a Pull Request

Run the following commands from this directory before submitting a pull request:

```sh
pnpm build
pnpm lint
pnpm coverage
```