# Reality Capture TypeScript Examples

This project contains examples that demonstrate how to:

- Upload and download data in an iTwin.
- Configure and submit a modeling reconstruction job.

## Prerequisites

- [Node.js](https://nodejs.org/en/) 22 or later.
- pnpm.
- An iTwin where input and output data can be stored.
- A Bentley service application with permission to access the iTwin, manage data, and submit Reality Capture jobs.

## Build

From the `typescript/examples` directory, install the dependencies and build the examples:

```sh
pnpm install
pnpm build
```

## Create or Select an iTwin

Input or output data are stored in iTwins. If you don't have one yet, go [here](https://connect.bentley.com/SelectProject/Index) and select "Register new project".

## Create a Service Application

To run the examples, you will also need a client application. To create one, go [here](https://developer.bentley.com/my-apps/) and select "Register new".
Select "Service" application type and register the application.

## Configure the Environment

After creating the iTwin and the application, change to the `typescript/examples` directory and configure the environment for the examples.
Copy [template.env](./template.env) to `.env`, then provide values for `IMJS_ITWIN_ID`, `IMJS_CLIENT_ID`, and `IMJS_CLIENT_SECRET`.

## Run Examples

From the `typescript/examples` directory, run one of the following commands:

- Upload & download reality data example

  ```sh
  pnpm start-upload-reality-data-example
  ```

- Upload & download bucket data example

  ```sh
  pnpm start-upload-bucket-data-example
  ```

- Modeling Reconstruction example

  ```sh
  pnpm start-modeling-example
  ```