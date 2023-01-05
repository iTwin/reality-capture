# Introduction

capture-sdks-examples contains some examples for capture-sdks.

It has been tested with Node 16.17.0 and should work with Node 16.17.0 and newer.

## Pre-reqs

To build and run the source code locally you will need a few things:

- Install [Node.js](https://nodejs.org/en/) v16 (must be greater than 16.17.x).
- Install [VS Code](https://code.visualstudio.com/).

## Build and run the examples

- Clone the repository

  ```sh
  git clone https://github.com/iTwin/reality-apis-samples
  ```

- Install dependencies

  ```sh
  cd reality-apis-samples/typescript/examples
  npm install
  ```
- If npm install doesn't work with node v16 and newer

  ```sh
  npm install --legacy-peer-deps
  ```

- Create a new `.env` file, based on `template.env`. Fill in the required fields in the `.env` configuration file.

- Then, replace the input data paths with yours. You can download data samples here : [data]https://communities.bentley.com/products/3d_imaging_and_point_cloud_software/w/wiki/54656/context-insights-detectors-download-page
- Replace qa/dev environment with the one you want to use.

- Build and run the project

  ```sh
  npm run build
  ```

- Run reality data creation example
  
  ```sh
  npm run start-rd-example
  ```

- Run 2d objects detection example
  
  ```sh
  npm run start-o2d-example
  ```

- Run 3d lines detection example
  
  ```sh
  npm run start-l3d-example
  ```

- Run context capture example
  
  ```sh
  npm run start-cc-example
  ```
