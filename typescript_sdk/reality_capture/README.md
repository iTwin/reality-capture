# reality-capture

reality-capture is a typescript package that allows any user to interact with Bentley Reality Capture services including:
 * [Reality Modeling](https://developer.bentley.com/apis/contextcapture/)
 * [Reality Analysis](https://developer.bentley.com/apis/realitydataanalysis/)
 * [Reality Conversion](https://developer.bentley.com/apis/realityconversion/)

## Building locally

### Pre-reqs

To build and run the source code locally you will need a few things:

- Install [Node.js](https://nodejs.org/en/) v22 (must be greater than 22.x).
- Install [VS Code](https://code.visualstudio.com/).

### Build

To build the reality-capture locally, open a new terminal in the current loation and run the following commands : 

- Install dependencies

  ```sh
  npm install
  ```

- Build the project

  ```sh
  npm run build
  ```

### Build package

In case you need a package to install it in your own project, run the following command :

- Build the project

  ```sh
  npm pack --pack-destination ./lib
  ```

You will find the .tgz file in /lib folder
Add this line in your project package.json:

- Build the project

  ```
  "reality-capture" : "<path_to_tgz>/reality-capture-1.0.0.tgz",
  ```

### Unit tests

Run the following command for the unit tests :

- Build the unit tests
  ```sh
  npm coverage
  ```

It will generate a report for each source file: covered lines, branches, statements and functions. Each file should be at least 90% covered.
