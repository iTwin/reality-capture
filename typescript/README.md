# Introduction

Copyright © Bentley Systems, Incorporated. All rights reserved. See 
[LICENSE.md](./LICENSE.md) for license terms and full copyright notice.

This is a simple node based console and browser apps that illustrate usage of the RealityData API.

## Table of contents

- [Pre-reqs](#pre-reqs)
  - [Resources](#resources)
  - [Client registration](#client-registration)
- [Getting started](#getting-started)
  - [Run samples (no UI)](#run-samples-no-ui)
  - [Debug the app](#debug-the-app)
  - [Data samples](#data-samples)
- [Project Structure](#project-structure)

## Pre-reqs

To build and run this app locally you will need a few things:

- Install [Node.js](https://nodejs.org/en/) v14 (must be greater than 14.17.x).
- Install [VS Code](https://code.visualstudio.com/).

### Resources

To successfully run this sample, you will need to have an access to two projects. If you don't
have one already, contact one of your Organization Administrators or take some time to go through the following tutorial:

- Create a [Project](https://developer.bentley.com/tutorials/create-and-query-projects-guide).

### Client registration

You need to register an Application to be able to access your data using this sample.
If you don't have one already, follow these steps to create an application.

1.  Go to https://developer.bentley.com.
2.  Click the Sign In button and sign-in using your Bentley account credentials.
    If you have not already registered, click Register now and complete the registration process.
3.  Click on your user icon at the top right and navigate to the 'My Apps' page.
4.  Click the 'Register New' button.
5.  Give your application a Name.
6.  Select the RealityData, iModels, Synchronization, Digital Twin Management and Administration associations.
7.  Select application type SPA (Single Page Web Application).
8.  Enter Redirect URL.
    For this tutorial use http://localhost:3000/signin-callback.
9.  Leave post logout redirect URIs empty.
10. Click the Save button.

You will receive a client id for the app. Put it in the .env file (AUTHORIZATION_CLIENT_ID)
with issuerUrl, redirectUrl and the proper scopes: `contextcapture:modify contextcapture:read itwinjs realitydataanalysis:read realitydataanalysis:modify realitydata:read realitydata:modify`

## Getting started

- Clone the repository

  ```sh
  git clone https://github.com/iTwin/reality-apis-samples
  ```

- Install dependencies

  ```sh
  cd reality-apis-samples/typescript
  npm install
  ```

- Fill in the required fields in the `.env` configuration file.

- Build and run the project

  ```sh
  npm run build
  npm run start:webapp
  ```

### Run samples (no UI)

To run the console application, it is almost the same process.
You need to register another Application. Select application type "Service" instead of "SPA", use these scopes : `contextcapture:modify contextcapture:read itwinjs realitydataanalysis:read realitydataanalysis:modify realitydata:read realitydata:modify` 

- Build and run the project

  ```sh
  npm run build
  npm run start:sample
  ```

### Debug the app

To debug the frontend, run
```
  npm run start:webapp
```
Then, in "Run and debug", run "Debug chrome" configuration.
To debug the backend, run the other configuration : "Attach by process ID", and select "node --inspect lib/backend/main.js"

### Data samples

To run rdas jobs, you can download datasets and detectors here : https://communities.bentley.com/products/3d_imaging_and_point_cloud_software/w/wiki/54656/context-insights-detectors-download-page

## Project Structure

The full folder structure of this app is explained below:

> **Note!** Make sure you have already built the app using `npm run build`

| Name                     | Description                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------|
| **.vscode**              | Contains VS Code specific settings                                                           |
| **data**                 | Integration tests input data                                                                 |  
| **lib**                  | Contains the distributable (or output) from your TypeScript build. This is the code you ship |
| **src**                  | Contains source code that will be compiled to the build dir                                  |
| .env                     | Settings for authentication and project IDs required for running the RealityData sample      |
| .eslintrc.json           | Configuration file for ESLint                                                                |
| .npmrc                   | npm configuration settings file                                                              |
| certa.json               | Certa configuration file for integration tests                                               |  
| package.json             | File that contains npm dependencies as well as build scripts                                 |
| tsconfig.json            | Config settings for compiling server code written in TypeScript                              |
| template.env             | template environment file. Mist be copied, renamed and filled to run the apps                |
| webpack.config.js        | webpack configuration to run integration tests                                               |