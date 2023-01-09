# Introduction

reality-capture is a typescript SDK for Reality Data Analysis and Context Capture. This SDK is based on the APIs
- [Reality Data Analysis](https://developer.bentley.com/apis/realitydataanalysis/)
- [Context Capture](https://developer.bentley.com/apis/contextcapture/) 
and should work he same way.

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