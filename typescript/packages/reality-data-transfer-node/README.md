# @itwin/reality-data-transfer-node

Copyright © Bentley Systems, Incorporated. All rights reserved. See LICENSE.md for license terms and full copyright notice.

## Description

The **@itwin/reality-data-transfer-node** package contains a sdk to upload local data to ContextShare and download reality data. Doesn't work in a browser environment.

## Requirements

A registered application in the iTwin Platform is needed for using reality data transfer node package. Documentation for registering an application can be found [here.](https://developer.bentley.com/tutorials/register-and-modify-application/) Make sure that your application has `realitydata:read realitydata:modify` scopes enabled. 

To use the data transfer package node, you will need to have an access to a project. If you don't have one already, contact one of your Organization Administrators or take some time to go through the following tutorial: Create a [Project](https://developer.bentley.com/tutorials/create-and-query-projects-guide).

To build and run reality data transfer node, you will need [Node.js](https://nodejs.org/en/) v18 (must be greater than 18.12.x).

## Key Types and Methods

### defaultProgressHook

Sample progress hook for upload and download

### RealityDataTransferNode

- `setUploadHook` : Set the upload progress hook
- `setDownloadHook` : Set the download progress hook
- `getScopes` : get the required scopes to use this client
- `uploadRealityData` : Upload reality data to ProjectWise ContextShare. Creates a new reality data.
    This function should not be used for ContextScenes or CCOrientations that contain dependencies to other data
    unless those dependencies are already uploaded and the file you want to upload points to their id. 
    Use uploadContextScene or uploadCCOrientation instead.
- `uploadJsonToWorkspace` : Upload .json files to an already existent workspace.
    Convenience function to upload specific settings to ContextCapture Service jobs. Files are uploaded to the
    workspace passed in argument in the folder job_id/data/ so that the service can find the files when the job is submitted.
    This function will upload *all* json files present at the path given in argument but not recursively (it won't
    upload json files in subdirectories).
- `uploadContextScene` : Upload a ContextScene to ProjectWise ContextShare.
    Convenience function that replaces references if a reference table is provided and upload the ContextScene.
    All local dependencies should have been uploaded before, and their IDs provided in the reference table.
- `uploadJsonToWorkspace` : Upload a CCOrientation to ProjectWise ContextShare.
    Convenience function that replaces references if a reference table is provided and upload the file.
    All local dependencies should have been uploaded before, and their IDs provided in the reference table.
- `downloadRealityData` : Download reality data from ProjectWise ContextShare.
    This function should not be used for ContextScenes that contain dependencies to data you have locally as the
    paths will point to ids in the ProjectWise ContextShare.
    Use downloadContextScene instead.
- `downloadContextScene` : Download a ContextScene from ProjectWise ContextShare.
    Convenience function that downloads the ContextScene and replaces references if a reference table is provided.
    All dependencies should have been downloaded before or already be local, and their IDs on the cloud and local
    paths should be provided in the reference table.
- `downloadCCorientations` : Download a CCOrientation from ProjectWise ContextShare.
    Convenience function that downloads the CCOrientation and replaces references if a reference table is provided.
    All dependencies should have been downloaded before or already be local, and their IDs on the cloud and local
    paths should be provided in the reference table.

### ReferenceTableNode

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

An example is available to show how to upload and download reality data. See [Reality Data Transfer](./../../examples/code-samples/src/RealityConversion.ts)