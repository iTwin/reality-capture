# Contributing

Copyright © Bentley Systems, Incorporated. All rights reserved. See LICENSE.md for license terms and full copyright notice.

## Developer notes

To build, run and test locally, this checklist below can help solve most issues.

- Delete node_modules folder if it's been a while.
- Verify local .env file. Check if test user credentials and all variables are good.
- Verify iTwin platform client ID in case it needs to be updated. <https://developer.bentley.com/my-apps/>
- Verify Node version is 18 or greater. This client should match the Node version requirement from `itwinjs-core` as described here in `nodeSupportedVersionRange` : <https://github.com/iTwin/itwinjs-core/blob/master/rush.json>

Example commands below to install, clean, build and test :
- `npm i`
- `npm run clean`
- `npm run build`
- `npm run lint`
- `npm run test:integration` to run integration tests locally.
- `npm run change` to generate a changelog entry.
  - We use [beachball](https://github.com/microsoft/beachball) to manage versioning and changelogs.
