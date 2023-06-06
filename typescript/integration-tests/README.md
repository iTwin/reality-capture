# Introduction

reality-capture-tests is a node project to run Reality Analysis, Reality Modeling and Reality Conversion integration tests. These integration tests have been added in the github [typescript workflow](../../.github/workflows/typescript.yml)

## Pre-reqs

To build and run integration tests locally you will need a few things:

- Install [Node.js](https://nodejs.org/en/) v16 (must be greater than 16.17.x).
- Install [VS Code](https://code.visualstudio.com/).

## Build and run integration tests locally

- Clone the repository

  ```sh
  git clone https://github.com/iTwin/reality-capture
  ```

- Since this repo has a (temporary) local dependency on typescript/sdk and typescript/sdk-node, 
  this project has to be build. See [sdk](./../sdk/README.md) and [sdk-node](./../sdk-node/README.md) for more information.

- Install dependencies

  ```sh
  cd reality-capture/typescript/integration-tests
  npm install
  ```
- If npm install doesn't work with node v16 and newer

  ```sh
  npm install --legacy-peer-deps
  ```

- Create a new `.env` file, based on `template.env`. Fill in the required fields in the `.env` configuration file.

- Build and run the project

  ```sh
  npm run build
  ```

- Run integration tests
  
  ```sh
  npm run test:integration
  ```

