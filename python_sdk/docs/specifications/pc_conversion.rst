======================
Point cloud conversion
======================

The *point cloud conversion* job takes a reality data point cloud as an input and will convert it in the selected format.
Should multiple point clouds be present in the reality data, each point cloud will be converted to a different file.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we create a specification for submitting a point cloud conversion job to LAS format:

.. literalinclude:: examples/pc_conv_specs.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.point_cloud_conversion

.. autopydantic_model:: PointCloudConversionSpecificationsCreate

.. autopydantic_model:: PointCloudConversionSpecifications

.. autopydantic_model:: PCConversionInputs
    :model-show-json: False

.. autopydantic_model:: PCConversionOptions
    :model-show-json: False

.. autoclass:: PCConversionFormat
    :show-inheritance:
    :members:
    :undoc-members:
