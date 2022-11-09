# Introduction

Reality-data-samples in typescript is a web application to show how reality iTwin services are working and display Reality Data Analysis outputs, such as Cesium 3D Tiles and Context Scenes.

- [Reality Data](https://developer.bentley.com/apis/reality-data/) provides the ability to retrieve information about the reality data that is associated with an infrastructure project.
- [Reality Data Analysis](https://developer.bentley.com/apis/realitydataanalysis/)
 is a service that runs Artificial Intelligence/Machine Learning (AI/ML) on photos, maps, meshes or point clouds. It can detect objects or features in 2D and 3D for defect analysis, image anonymization, image indexing, asset management, mobile mapping, aerial surveying, and more.
- [Context Capture](https://developer.bentley.com/apis/contextcapture/) is a service that turns images and point clouds into reality meshes, orthophotos and other by-products.

It has been tested with Node 14.18.1 and should work with Node 14.18.1 and newer.

## Table of contents

- [Pre-reqs](#pre-reqs)
  - [Resources](#resources)
  - [Client registration](#client-registration)
- [Getting started](#getting-started)
  - [Debug the app](#debug-the-app)
  - [Data samples](#data-samples)
  - [Upload context scenes and orientations](#upload-context-scenes-and-orientations)
- [Project Structure](#project-structure)

## Pre-reqs

To build and run this app locally you will need a few things:

- Install [Node.js](https://nodejs.org/en/) v14 (must be greater than 14.17.x).
- Install [VS Code](https://code.visualstudio.com/).

### Resources

To successfully run this sample, you will need to have an access to at least one project. If you don't
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
  cd reality-apis-samples/typescript/web-app
  npm install
  ```
- If npm install doesn't work with node > 14

  ```sh
  npm install --legacy-peer-deps
  ```

- Fill in the required fields in the `.env` configuration file.

- Build and run the project

  ```sh
  npm run build
  npm run start
  ```

### Debug the app

To debug the frontend, run
```
  npm run start
```
Then, in "Run and debug", run "Debug chrome" configuration.

### Data samples

To run rdas jobs, you can download datasets and detectors here : https://communities.bentley.com/products/3d_imaging_and_point_cloud_software/w/wiki/54656/context-insights-detectors-download-page

### Upload context scenes and orientations

In order to get consistent context scenes and orientations on Context Share, you have to upload the data referenced in those files first. Indeed, context scenes and orientations contain local paths to image collections, point clouds... however, when the context scene is uploaded, these paths are not valid anymore. To have the paths replaced when the context scene is uploaded, you have to : 
1. Upload the images first. Provide the images folder, the images should be at the root of this folder, and at the same level (no sub folders).
2. Edit your context scene to replace reference paths with the reference id. To upload an orientations file it is very similar, but it does not have references. The image paths have to be changed, it should be the index of the image collection in the order it has been uploaded, i.e 0 for the first uploaded image collection, 1 for the second one and so on, followed by / and the image name.

It is very important to upload the image collections before the context scene and set the right index in the context scene, otherwise the job might not be successful.

## Project Structure

The full folder structure of this app is explained below:

> **Note!** Make sure you have already built the app using `npm run build`

| Name                     | Description                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------|
| **.vscode**              | Contains VS Code specific settings                                                           |
| **lib**                  | Contains the distributable (or output) from your TypeScript build. This is the code you ship |
| **src**                  | Contains source code that will be compiled to the build dir                                  |
| .env                     | Settings for authentication and project IDs required for running the RealityData sample      |
| .eslintrc.json           | Configuration file for ESLint                                                                |
| .npmrc                   | npm configuration settings file                                                              |
| package.json             | File that contains npm dependencies as well as build scripts                                 |
| tsconfig.json            | Config settings for compiling server code written in TypeScript                              |
| template.env             | template environment file. Mist be copied, renamed and filled to run the apps                |
