# Reality Capture SDK examples

These examples demonstrate authentication, data uploads, and Reality Capture job submission with the Python SDK.

## Prerequisites

- Python 3.10 or later.
- An iTwin where input and output data can be stored.
- A Bentley service application with access to the iTwin.

## Create or Select an iTwin

Input or output data are stored in iTwins. If you don't have one yet, go [here](https://connect.bentley.com/SelectProject/Index) and select "Register new project".

## Create a Service Application

To run the examples, you will also need a client application. To create one, go [here](https://developer.bentley.com/my-apps/) and select "Register new".
Select "Service" application type and register the application.

## Configure the Environment

After creating the iTwin and the application, change to the `python_sdk/examples` directory and configure the environment for the examples.
Copy [template.env](./template.env) to `.env`, then provide values for `ITWIN_ID`, `CLIENT_ID`, and `CLIENT_SECRET`.

## Set Up a Python Virtual Environment

- From the `python_sdk` directory, create a new virtual environment.

  ```sh
  python -m venv .venv
  ```

- Activate the environment.

  Windows Command Prompt:

  ```bat
  .venv\Scripts\activate.bat
  ```

  Windows PowerShell:

  ```powershell
  .venv\Scripts\Activate.ps1
  ```

  Linux or macOS:

  ```sh
  source .venv/bin/activate
  ```

- From the `python_sdk` directory, install the SDK and the dependencies required by the examples.

  ```sh
  python -m pip install -e ".[dev]"
  ```

- Alternatively, install a wheel from the [GitHub releases](https://github.com/iTwin/reality-capture/releases) page together with the dependency required by the examples.

  ```sh
  python -m pip install <path-to-reality_capture_sdk.whl> python-dotenv
  ```

## Run Examples

From the `python_sdk/examples` directory, run one of the following commands:

- Upload & download reality data example

  ```sh
  python example_upload_reality_data.py
  ```

- Upload & download bucket data example

  ```sh
  python example_upload_bucket_data.py
  ```

- Modeling Reconstruction example

  ```sh
  python example_modeling.py
  ```