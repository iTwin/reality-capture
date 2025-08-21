# Introduction

reality-capture-examples contains reality capture examples for modeling, analysis and conversion.

It has been tested with Node 18.12.0 and should work with Node 18.12.0 and newer.

## Pre-reqs

To build and run the source code locally you will need a few things:

- Install [Node.js](https://nodejs.org/en/) must be greater than 18.12.x.
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
  pnpm build
  ```

- Create a new `.env` file in typescript/examples/code-samples, based on `template.env` root file. Fill in the required fields in the `.env` configuration file.

- Then, in the script, fill in the required inputs. You can download data samples here : [data](https://communities.bentley.com/products/3d_imaging_and_point_cloud_software/w/wiki/54656/context-insights-detectors-download-page)

- Before running the examples, move to code-samples folder
  ```sh
  cd typescript/examples/code-samples
  ```

- Run reality data management example

  ```sh
  npm run start-data-example
  ```

- Run reality modeling example

  ```sh
  npm run start-cc-example
  ```

- Run reality conversion example
  
  ```sh
  npm run start-conversion-example
  ```

- Run 2d objects detection example
  
  ```sh
  npm run start-o2d-example
  ```

- Run 2d segmentation example
  
  ```sh
  npm run start-s2d-example
  ```