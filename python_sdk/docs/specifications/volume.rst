==================
Volume Calculation
==================

The *Volume calculation* job allows you to compute volume information for a 3D model within a specified region of interest. Currently, footprint has to be provided as a GeoJSON polygon file or a WKT polygon text file.


.. contents:: Quick access
    :local:
    :depth: 2

Examples
========

In this example, we will create a specification for submitting a volume computation job.

.. literalinclude:: examples/volume_specs.py
   :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.volume

.. autopydantic_model:: VolumeSpecificationsCreate

.. autoclass:: VolumeOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: VolumeSpecifications

.. autopydantic_model:: VolumeInputs
    :model-show-json: False

.. autopydantic_model:: VolumeOutputs
    :model-show-json: False
