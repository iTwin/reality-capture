# Reality Capture SDK examples

## Create an iTwin

Input or output data are stored in iTwins. If you don't have one yet, go [here](https://connect.bentley.com/SelectProject/Index) and select "Register new project".

## Create a client application

To run the examples, you will also need a client application. To create one, go [here](https://developer.bentley.com/my-apps/) and select "Register new".
Select "Service" application type and register the application.

## Configure environment

Once you have created the iTwin and the application, you must configure the environment for the examples.
Copy the [template.env](./template.env) file, rename it to ".env" and fill in the environment variables.

## Create python virtual environment

- Create a new virtual environment

  ```sh
  python -m venv virtual_env_name
  ```

- Then, to activate the environment, run this command in virtual_env_name/Scripts

  ```sh
  activate.bat
  ```

- Install Reality Capture SDK. Run this command in 'python_sdk' folder.

  ```sh
  pip install . -e
  ```

- Alternatively, you can install Reality Capture SDK from an existing wheel. You can find the wheel in the GitHub repo : [Releases](https://github.com/iTwin/reality-capture/releases)

  ```sh
  pip install <reality_capture_sdk.whl>
  ```

- Install dev dependencies. Run this command in 'python_sdk' folder.

  ```sh
  pip install .[dev]
  ```

## Run examples

Run these commands in 'python_sdk/examples' folder.

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