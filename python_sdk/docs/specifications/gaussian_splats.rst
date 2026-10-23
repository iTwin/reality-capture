===============
Gaussian Splats
===============

The *Gaussian Splats* job allows to create gaussian splats from a calibrated ContextScene with tie points.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we create a specification for submitting a gaussian splats job with 3D Tiles format:

.. literalinclude:: examples/gaussian_specs_3dt.py
  :language: Python


Classes
=======

.. currentmodule:: reality_capture.specifications.gaussian_splats

.. autopydantic_model:: GaussianSplatsSpecificationsCreate
    :inherited-members: BaseModel

.. autoclass:: GaussianSplatsOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: GaussianSplatsSpecifications
    :inherited-members: BaseModel

.. autopydantic_model:: GaussianSplatsInputs
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: GaussianSplatsOutputs
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: GaussianSplatsOptions
    :inherited-members: BaseModel
    :model-show-json: False

.. autoclass:: GSFormat
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: GSQuality
    :show-inheritance:
    :members:
    :undoc-members:
