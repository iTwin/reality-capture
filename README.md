# reality-capture

Copyright © Bentley Systems, Incorporated. All rights reserved. See 
[LICENSE.md](./LICENSE.md) for license terms and full copyright notice.

## About this Repository

This repository contains Reality Capture SDKs for Reality Modeling, Reality Analysis, Reality Conversion and Reality Management services. It provides classes, functions and examples to create reality data, upload local data to Reality Management, run Analysis/Conversion/Modeling jobs and download results.

- [Reality Management](./typescript_sdk/packages/reality-data-client/README.md)
- [Reality Capture](./typescript_sdk/packages/reality-capture/README.md)

All the packages are also available in python

- [Python sdk](./python_sdk/README.md)

## Requirements

- [Git LFS](https://git-lfs.github.com/) to be installed.
- [Node](https://nodejs.org/en/): an installation of the latest security patch of Node 22. The Node installation also includes the **npm** package manager.
- [pnpm](https://pnpm.io/): [prefer installation via npm corepack](https://pnpm.io/installation#using-corepack)

## Build Instructions

1. Clone repository (first time) with `git clone` or pull updates to the repository (subsequent times) with `git pull`
2. Install dependencies: `pnpm update` or `pnpm install`
3. Build source: `npm run build`
4. Run unit tests : create a .env file based on template.env, then : `npm run coverage`