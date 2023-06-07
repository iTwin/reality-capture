# Introduction

reality-capture is a typescript SDK for Reality Analysis, Reality Modeling and Reality Conversion Services. This SDK is based on the APIs
- [Reality Analysis](https://developer.bentley.com/apis/realitydataanalysis/)
- [Reality Modeling](https://developer.bentley.com/apis/contextcapture/) 
- [Reality conversion](https://developer.bentley.com/apis/realityconversion/)
and should work the same way.

# Node support

This package does not support Node environment for data transfer. However, reality-capture-node extends this package so it is possible to upload and download in Node environment. See [reality-capture-node](./../sdk-node/README.md) for more
information about this package.

## Pre-reqs

To build reality-capture, you will need a few things:

- Install [Node.js](https://nodejs.org/en/) v16 (must be greater than 16.17.x).
- Install [VS Code](https://code.visualstudio.com/).

## Build project

- Clone the repository

  ```sh
  git clone https://github.com/iTwin/reality-capture
  ```

- Install dependencies

  ```sh
  cd reality-capture/typescript/sdk
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

# Integration tests

To run reality-capture integration-tests, see [integration-tests](./../integration-tests/README.md)

# Examples

To run reality-capture examples, see [examples](./../examples/README.md)

# Web app

It is possible to import reality-capture in a browser application, see [web-app](./../web-app/README.md)