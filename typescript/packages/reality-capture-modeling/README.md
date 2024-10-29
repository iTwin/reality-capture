# @itwin/reality-capture-modeling

Copyright © Bentley Systems, Incorporated. All rights reserved. See LICENSE.md for license terms and full copyright notice.

## Description

The **@itwin/reality-capture-modeling** package contains a sdk to send requests to the Reality Modeling API, part of the iTwin platform.

iTwin.js is an open source platform for creating, querying, modifying, and displaying Infrastructure Digital Twins. To learn more about the iTwin Platform and its APIs, visit the iTwin developer portal.

## Documentation

For more information about Reality Conversion package, see [Reality Modeling APi documentation](https://developer.bentley.com/apis/contextcapture/)

## Requirements

A registered application in the iTwin Platform is needed for using the Reality Modeling Service. Documentation for registering an application can be found [here.](https://developer.bentley.com/tutorials/register-and-modify-application/) Make sure that your application has `contextcapture:read contextcapture:modify` scopes enabled. 

To use the Reality Modeling API you will need to have an access to a project. If you don't have one already, contact one of your Organization Administrators or take some time to go through the following tutorial: Create a [Project](https://developer.bentley.com/tutorials/create-and-query-projects-guide).

To build and run the Reality Modeling service, you will need [Node.js](https://nodejs.org/en/) v18 (must be greater than 18.12.x).

## Key Types and Methods

### ContextCaptureService

Serves a client wrapper to the Reality Modeling API. It contains all the necessary methods to fulfill any workflow related to create, submit and monitor Reality Analysis jobs.

- `getScopes` : returns the required scopes
- `createWorkspace` : create a workspace (required to create a Modeling job)
- `deleteWorkspace` : delete the given workspace
- `getWorkspace` : get the given workspace
- `createJob` : create a job from the given settings
- `submitJob` : submit the given job
- `cancelJob` : cancel the given job
- `deleteJob` : delete the given job
- `getJobProgress` : get the progress of the given job
- `getJobProperties` : get the properties of the given job, such as the settings, the creation date etc...
- `getJobEstimatedCost` : get the estimation cost

### CCJobType

Enumerates the current existing job types.

### CCWorkspaceProperties

Describes a workspace.

### CCCostParameters

Estimated job cost.

### CCJobProperties

Describes a job (id, name, settings, etc...)

### CCJobQuality

Generated mesh quality. Use "Draft" for testing purpose.

### CCCacheSettings

Describe how a job will use and create cache.

### CCJobSettings

Describes a job : its inputs, outputs, and other parameters.

## Usage example

An example is available to show how to create jobs and get its results. See [Reality Modeling example](./../../examples/code-samples/src/Modeling.ts)