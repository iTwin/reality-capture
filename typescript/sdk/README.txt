# Introduction

reality-services is a typescript SDK for Reality Data Analysis and Context Capture. These SDK are based on the APIs
- [Reality Data Analysis](https://developer.bentley.com/apis/realitydataanalysis/)
- [Context Capture](https://developer.bentley.com/apis/contextcapture/) 
and should work he same way.

Moreover, it contains Reality Data utils to upload and download reality data. 
See [Reality Data]https://developer.bentley.com/apis/reality-data/ for more information.

It has been tested with Node 14.18.1 and should work with Node 14.18.1 and newer.

## Pre-reqs

To build and run the source code locally you will need a few things:

- Install [Node.js](https://nodejs.org/en/) v14 (must be greater than 14.17.x).
- Install [VS Code](https://code.visualstudio.com/).

## Run the examples

- Clone the repository

  ```sh
  git clone https://github.com/iTwin/reality-apis-samples
  ```

- Install dependencies

  ```sh
  cd reality-apis-samples/typescript/sdk
  npm install
  ```
- If npm install doesn't work with node > 14

  ```sh
  npm install --legacy-peer-deps
  ```

- Add a `.env`file based on `template.env`. Fill in the required fields in the `.env` configuration file.

- Then, replace the input data paths with yours. You can download data samples here : [data]https://communities.bentley.com/products/3d_imaging_and_point_cloud_software/w/wiki/54656/context-insights-detectors-download-page
- Replace qa and dev environment with the one you want to use.

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
