# reality-capture

Copyright © Bentley Systems, Incorporated. All rights reserved. See 
[LICENSE.md](./LICENSE.md) for license terms and full copyright notice.

## About this Repository

This repository contains Reality Capture SDKs for Reality Modeling, Reality Analysis, Reality Conversion and Reality Management services, as well as Reality Management API utils. It provides classes, functions and examples to create reality data, upload local data to Reality Management, run Analysis/Conversion/Modeling jobs and download results.
Besides, a typescript web application example is available to show how to create a web application running the whole workflow and displaying the results in the browser.

- [Reality Management](./typescript/packages/reality-data-client/README.md)
- [Reality Analysis](./typescript/packages/reality-capture-analysis/README.md)
- [Reality Conversion](./typescript/packages/reality-capture-conversion/README.md)
- [Reality Modeling](./typescript/packages/reality-capture-modeling/README.md)

Reality data utils to upload and download results

- [Reality Data transfer utils](./typescript/packages/reality-data-transfer/README.md)

All the packages are available in python, except Reality Management

- [Python sdk](./python/README.md)

## Requirements

- [Git LFS](https://git-lfs.github.com/) to be installed.
- [Node](https://nodejs.org/en/): an installation of the latest security patch of Node 18. The Node installation also includes the **npm** package manager.
- [pnpm](https://pnpm.io/): [prefer installation via npm corepack](https://pnpm.io/installation#using-corepack)

## Build Instructions

1. Clone repository (first time) with `git clone` or pull updates to the repository (subsequent times) with `git pull`
2. Install dependencies: `pnpm update` or `pnpm install`
3. Build source: `npm run build`
4. Run unit tests : create a .env file based on template.env, then : `npm run coverage`