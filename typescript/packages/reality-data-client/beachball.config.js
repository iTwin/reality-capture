/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

/** @type {import("beachball").BeachballConfig } */
module.exports = {
  bumpDeps: false,
  access: "public",
  tag: "latest",
  ignorePatterns: [
    ".github/**",
    ".vscode/**",
    ".*ignore",
    ".*rc",
    "certa.json",
    "package-lock.json",
    "tsconfig.*",
  ],
  changehint: "Run 'npm run change' to generate a change file",
};
