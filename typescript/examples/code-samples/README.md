# Introduction

reality-capture-examples contains reality capture examples.

It has been tested with Node 18.12.0 and should work with Node 18.12.0 and newer.

## Pre-reqs

To build and run the source code locally you will need a few things:

- Install [Node.js](https://nodejs.org/en/) v18 (must be greater than 18.12.x).
- Install [VS Code](https://code.visualstudio.com/).

## Build and run the examples

- Clone the repository

  ```sh
  git clone https://github.com/iTwin/reality-capture
  ```

- Open a command prompt in the root directory

- Install dependencies

  ```sh
  pnpm install
  ```

- Build the project

  ```sh
  npm run build
  ```

- Create a new `.env` file, based on `template.env`. Fill in the required fields in the `.env` configuration file.

- Then, replace the input data paths with yours. You can download data samples here : [data](https://communities.bentley.com/products/3d_imaging_and_point_cloud_software/w/wiki/54656/context-insights-detectors-download-page)
- Replace qa/dev environment with the one you want to use.

- Run reality data creation example
  
- Run context capture example
  
  ```sh
  cd examples/code-samples
  npm run start-cc-example
  ```

  ```sh
  cd examples/code-samples
  npm run start-data-example
  ```

- Run 2d objects detection example
  
  ```sh
  cd examples/code-samples
  npm run start-o2d-example
  ```

- Run reality conversion example
  
  ```sh
  cd examples/code-samples
  npm run start-rcs-example
  ```

- Run 2d segmentation example
  
  ```sh
  cd examples/code-samples
  npm run start-s2d-example
  ```