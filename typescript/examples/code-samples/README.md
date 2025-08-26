# Introduction

reality-capture-examples contains reality capture examples for modeling, analysis and conversion.

It has been tested with Node 22.14.0 and should work with Node 22.14.0 and newer.

## Pre-reqs

To build and run the source code locally you will need a few things:

- Install [Node.js](https://nodejs.org/en/) v22 (has been tested with 22.14.0 and should work with newer versions).
- Install [VS Code](https://code.visualstudio.com/).

## Build and run the examples

- To build the code samples, please follow the steps the in the root [README](../../../README.md)

- In `typescript/examples/code-samples`, you will find a `template.env` file. Create a new `.env` file based on this file and fill in the required fields.

- Then, in the sample code, replace the input data paths with yours. You can download data samples here : [data](https://bentleysystems.service-now.com/community?sys_kb_id=cda378791b714690dc6db99f034bcb5c&id=kb_article_view&sysparm_rank=1&sysparm_tsqueryId=1c9303b31bb1e610dc6db99f034bcb85)

- To run the samples, open a terminal in `code-samples` folder and run these commands :
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

## iTwin Applications

To run the samples, you will need an iTwin Application.
You can see yours, or create a new one [here](https://developer.bentley.com/my-apps/)
For all samples except ModelingWithService and RealityConversion, you will need to create a Native application.
ModelingWithService and RealityConversion samples require a Service application.