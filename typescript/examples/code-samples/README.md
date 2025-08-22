# Introduction

reality-capture-examples contains reality capture examples for modeling, analysis and conversion.

It has been tested with Node 22.14.0 and should work with Node 22.14.0 and newer.

## Pre-reqs

To build and run the source code locally you will need a few things:

- Install [Node.js](https://nodejs.org/en/) v22 (has been tested with 22.14.0 and should work with newer versions).
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

- Then, replace the input data paths with yours. You can download data samples here : [data](https://bentleysystems.service-now.com/community?sys_kb_id=cda378791b714690dc6db99f034bcb5c&id=kb_article_view&sysparm_rank=1&sysparm_tsqueryId=1c9303b31bb1e610dc6db99f034bcb85)

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