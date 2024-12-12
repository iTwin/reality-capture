# @itwin/reality-capture-analysis

Copyright © Bentley Systems, Incorporated. All rights reserved. See LICENSE.md for license terms and full copyright notice.

## Description

The **@itwin/reality-capture-analysis** package contains a sdk to send requests to the Reality Analysis API, part of the iTwin platform.

iTwin.js is an open source platform for creating, querying, modifying, and displaying Infrastructure Digital Twins. To learn more about the iTwin Platform and its APIs, visit the iTwin developer portal.

## Documentation

For more information about Reality Analysis package, see [Reality Analysis APi documentation](https://developer.bentley.com/apis/realitydataanalysis/)

## Requirements

A registered application in the iTwin Platform is needed for using the Reality Analysis Service. Documentation for registering an application can be found [here.](https://developer.bentley.com/tutorials/register-and-modify-application/) Make sure that your application has `realitydataanalysis:read realitydataanalysis:modify` scopes enabled. 

To use the Reality Analysis API you will need to have an access to a project. If you don't have one already, contact one of your Organization Administrators or take some time to go through the following tutorial: Create a [Project](https://developer.bentley.com/tutorials/create-and-query-projects-guide).

To build and run the Reality Analysis service, you will need [Node.js](https://nodejs.org/en/) v18 (must be greater than 18.12.x).

## Key Types and Methods

### RealityDataAnalysisService

Serves a client wrapper to the Reality Analysis API. It contains all the necessary methods to fulfill any workflow related to create, submit and monitor Reality Analysis jobs.

- `getScopes` : returns the required scopes
- `createJob` : create a job from the given settings
- `submitJob` : submit the given job
- `cancelJob` : cancel the given job
- `deleteJob` : delete the given job
- `getJobProgress` : get the progress of the given job
- `getJobProperties` : get the properties of the given job, such as the settings, the creation date etc...
- `getJobEstimatedCost` : get the estimation cost

### RDASJobType

Enumerates the current existing job types. Should be provided when creating a job.
Documentation for job types can be found [here.](https://developer.bentley.com/apis/realitydataanalysis/rda-jobtypes/)

### JobSettings

Describes a job : its inputs, outputs, and other parameters.
Documentation for job settings can be found [here.](https://developer.bentley.com/apis/realitydataanalysis/rda-jobtypes/)

### RDACostParameters

Parameters for estimating job cost before its processing.

### RDAJobProperties

Contains all the provided job properties, such as name, id, settings...

## Usage example

An example is available to show how to create jobs and get its results. See [Reality Analysis O2D example](./../../examples/code-samples/src/Objects2D.ts) and [Reality Analysis S2D example](./../../examples/code-samples/src/Segmentation2D.ts)