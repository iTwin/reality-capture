# reality-capture

Copyright © Bentley Systems, Incorporated. All rights reserved. See 
[LICENSE.md](./LICENSE.md) for license terms and full copyright notice.

## About This Repository

This monorepo contains SDKs, examples, and documentation for Bentley Reality Capture services, including Reality Management, Reality Modeling, Reality Analysis, and Reality Conversion.

| Package | Description | Status |
| --- | --- | --- |
| [Reality Capture TypeScript SDK](./typescript/packages/reality-capture/README.md) | APIs and workflow specifications for Reality Capture services. | Active |
| [Reality Data Client TypeScript package](./typescript/packages/reality-data-client/README.md) | Reality Management API wrappers. | Deprecated; approved critical fixes only |
| [Reality Capture Python SDK](./python_sdk/README.md) | Python APIs and examples for Reality Capture services. | Active |

## Examples

- [TypeScript examples](./typescript/examples/README.md) demonstrate data upload and download workflows and modeling reconstruction.
- [Python examples](./python_sdk/examples/README.md) demonstrate authentication, data uploads, and Reality Capture job submission.

## Requirements

- [Git LFS](https://git-lfs.github.com/) for cloning the repository.

To build or contribute to the TypeScript packages, install:

- [Node.js](https://nodejs.org/en/): the latest security patch of Node.js 22. Node.js includes the **npm** package manager.
- [pnpm](https://pnpm.io/): [prefer installation via npm corepack](https://pnpm.io/installation#using-corepack). We recommend installing it globally.

For Python SDK requirements, see the [Python SDK README](./python_sdk/README.md).

## Development

Follow the setup, build, lint, test, and release instructions for the package you are changing:

- [Reality Capture TypeScript SDK contribution guide](./typescript/packages/reality-capture/CONTRIBUTING.md)
- [Reality Data Client TypeScript maintenance guide](./typescript/packages/reality-data-client/CONTRIBUTING.md)
- [Reality Capture Python SDK contribution instructions](./python_sdk/README.md#contributing)

For repository-wide issue and pull request guidance, see [CONTRIBUTING.md](./CONTRIBUTING.md).