# Introduction

reality-capture-node extends reality-capture package to add data transfer and token factory Node support.
See [reality-capture](./../sdk/README.md) for more information about the main package.

## Pre-reqs

To build reality-capture-node, you will need a few things:

- Install [Node.js](https://nodejs.org/en/) v16 (must be greater than 16.17.x).
- Install [VS Code](https://code.visualstudio.com/).

## Build project

- Clone the repository

  ```sh
  git clone https://github.com/iTwin/reality-capture
  ```

- Install dependencies

  ```sh
  cd reality-capture/typescript/sdk-node
  npm install
  ```
- If npm install doesn't work with node v16 and newer

  ```sh
  npm install --legacy-peer-deps
  ```

- Build the project

  ```sh
  npm run build
  ```