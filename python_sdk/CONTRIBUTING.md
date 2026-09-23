# Contributing

Thank you for your interest in contributing to the Reality Capture Python SDK.

This guide describes how to set up the SDK locally, run tests, and build the documentation.

## Table of Contents

- [Contributing](#contributing)
  - [Table of Contents](#table-of-contents)
  - [Source Code Edit Workflow](#source-code-edit-workflow)
    - [Prerequisites](#prerequisites)
    - [Unit tests](#unit-tests)
    - [Documentation](#documentation)
    - [Before Submitting a Pull Request](#before-submitting-a-pull-request)

## Source Code Edit Workflow

Run the commands in this guide from the `python_sdk` directory.

### Prerequisites

To build and run the source code locally, install Python 3.10 or later and create a virtual environment:

```bash
python -m venv .venv
```

Activate the virtual environment:

Windows Command Prompt:

```bat
.venv\Scripts\activate.bat
```

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Linux or macOS:

```bash
source .venv/bin/activate
```

Install the SDK and development dependencies in editable mode:

```bash
python -m pip install -e ".[dev]"
```


### Unit tests

Run the test suite from the `python_sdk` directory:

```bash
python -m pytest
```

### Documentation

Build and install the wheel before generating documentation:

```bash
python -m pip install build
python -m build
```

Install the generated wheel:

```bash
python -m pip install --force-reinstall dist/reality_capture-X.Y.0-py3-none-any.whl
```

Then build the Sphinx documentation from the `python_sdk/docs` directory:

Linux or macOS:

```bash
make html
```

Windows:

```bat
make.bat html
```

The generated HTML documentation is available in `docs/_build/html/index.html`.

### Before Submitting a Pull Request

Before submitting a pull request, run the test suite and build the documentation if your change affects public APIs or documentation:

```bash
python -m pytest
```

