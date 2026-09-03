========================
Point cloud optimization
========================

The *point cloud optimization* job takes one or multiple reality data point cloud as an input and will consolidate them into a single point cloud.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we create a specification for submitting a point cloud optimization job to 3D Tiles format:

.. literalinclude:: examples/pc_optim_specs.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.point_cloud_optimization

.. autopydantic_model:: PCOptimizationSpecificationsCreate

.. autopydantic_model:: PCOptimizationSpecifications

.. autopydantic_model:: PCOptimizationInputs
    :model-show-json: False

.. autopydantic_model:: PCOptimizationOptions
    :model-show-json: False

.. autoclass:: PCOptimizationFormat
    :show-inheritance:
    :members:
    :undoc-members:
