# Introduction

reality-capture is a typescript SDK for Reality Data Analysis and Context Capture. This SDK is based on the APIs
- [Reality Data Analysis](https://developer.bentley.com/apis/realitydataanalysis/)
- [Context Capture](https://developer.bentley.com/apis/contextcapture/) 
and should work he same way.

## Pre-reqs

To build and run integration tests locally you will need a few things:

- Install [Node.js](https://nodejs.org/en/) v16 (must be greater than 16.17.x).
- Install [VS Code](https://code.visualstudio.com/).

## Build and run integration tests locally

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

- Create a new `.env` file, based on `template.env`. Fill in the required fields in the `.env` configuration file.

- Build and run the project

  ```sh
  npm run build
  ```

- Run integration tests
  
  ```sh
  npm run test:integration
  ```

