# @itwin/reality-data-transfer

Copyright © Bentley Systems, Incorporated. All rights reserved. See LICENSE.md for license terms and full copyright notice.

## Description

The **@itwin/reality-data-transfer** package contains a sdk to upload local data to ContextShare and download reality data. Doesn't work in a node environment.

## Requirements

A registered application in the iTwin Platform is needed for using reality data transfer package. Documentation for registering an application can be found [here.](https://developer.bentley.com/tutorials/register-and-modify-application/) Make sure that your application has `realitydata:read realitydata:modify` scopes enabled. 

To use the data transfer package, you will need to have an access to a project. If you don't have one already, contact one of your Organization Administrators or take some time to go through the following tutorial: Create a [Project](https://developer.bentley.com/tutorials/create-and-query-projects-guide).

To build and run reality data transfer, you will need [Node.js](https://nodejs.org/en/) v18 (must be greater than 18.12.x).

## Key Types and Methods

### defaultProgressHook

Sample progress hook for upload and download

### RealityDataTransferBrowser

- `setUploadHook` : Set the upload progress hook
- `setDownloadHook` : Set the download progress hook
- `getScopes` : get the required scopes to use this client.
- `downloadRealityDataBrowser` : download reality data from ProjectWise ContextShare
- `uploadRealityDataBrowser` : upload reality data to ProjectWise ContextShare

### ReferenceTableBrowser

Stores the local path and cloud id of each uploaded data. When uploading a new reality data such as context scene, it might contains local paths, which doesn't mean anything in the cloud. The reference table will check for any local path in the context scene and replace it with the corresponding cloud id.

- `save` : open a file picker and save references as txt file
- `load` : load references from selected file. Open a file picker to select the reference file
- `addReference` : add a new entry in the reference table
- `removeReference` : remove entry from the reference table
- `hasLocalPath` : check if the provided local path exists in the reference table
- `hasCloudId` : check if the provided cloud id exists in the reference table
- `getCloudIdFromLocalPath` : get a reality data id from a local path
- `getLocalPathFromCloudId` : get a local path from a reality data id

## Usage example

An example is available to show how to upload local data and download reality data. See [Reality Reality data example](./../../examples/code-samples/src/DataTransfer.ts)