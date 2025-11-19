# reality-capture-examples

reality-capture-examples contains many examples you can run locally to show how to :
 * Upload local data in an iTwin, and how to download data from an iTwin
 * Configure and submit a Modeling Reconstruction job

## Building locally

### Pre-reqs

To build and run the source code locally you will need a few things:

- Install [Node.js](https://nodejs.org/en/) v22 (must be greater than 22.x).
- Install [VS Code](https://code.visualstudio.com/).

### Build

Then, open a new terminal in the current loation and run the following commands : 

- Install dependencies

  ```sh
  npm install
  ```

- Build the project

  ```sh
  npm run build
  ```

## Create an iTwin

Input ou output data are stored in iTwins. If you don't have one yet, go [here](https://connect.bentley.com/SelectProject/Index) and select "Register new project".

## Create a client application

To run the examples, you will also need a client application. To create one, go [here](https://developer.bentley.com/my-apps/) and select "Register new".
Select "Service" application type and register the application.

## Configure environment

Once you have created the iTwin and the application, you must configure the environment for the examples.
Copy the [.env](./template.env), rename it to ".env" and fill in the environment variables.

## Run examples

You can now run the examples

- Upload & download reality data example

  ```sh
  npm run start-upload-reality-data-example
  ```

- Upload & download bucket data example

  ```sh
  npm run start-upload-bucket-data-example
  ```

- Modeling Reconstruction example

  ```sh
  npm run start-modeling-example
  ```