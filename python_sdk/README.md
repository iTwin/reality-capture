# reality-capture

![Python Badge](https://img.shields.io/badge/python-3.10_|_3.11_|_3.12_|_3.13-blue)

reality-capture is a Python package that allows any user to interact with Bentley Reality Capture services including:
 * [Reality Management](https://developer.bentley.com/apis/reality-management/)
 * [Reality Modeling](https://developer.bentley.com/apis/contextcapture/)
 <!--- * [Reality Conversion](https://developer.bentley.com/apis/realityconversion/)-->
 <!--- * [Reality Analysis](https://developer.bentley.com/apis/realitydataanalysis/)-->

## Getting started

To install the package, head to the [releases page](https://github.com/iTwin/reality-capture/releases) and download the latest whl package. 
Then install it with this command:

```bash
pip install path/to/reality_capture-X.Y.0-py3-none-any.whl 
```

In order to use this package, an iTwin platform account and a registered application are required.
Please head to the [Bentley developer portal](https://developer.bentley.com/) to create an account. 
You can follow this [tutorial](https://developer.bentley.com/tutorials/register-and-modify-application/) to learn more about this process.

Documentation for the package is available on the [Bentley Product Documentation website](https://docs.bentley.com/LiveContent/web/Reality%20Capture%20Python%20SDK-v2.0.0/User%20Guide/en/index.html).

## Contributing

In order to contribute, you'll need to clone the repository, install the package locally and install the dev dependencies

```bash
pip install . -e
pip instal .[dev]
```

Tests are located in the `tests` subfolder and can be run with `pytest`.
Documentation is created with Sphinx and can be built by calling `make html` from within the `docs` folder.