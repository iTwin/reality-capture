==============
Extract Ground
==============

ExtractGroundSpecifications is designed to submit a job that extracts ground points from input data.
The inputs are collected in a ContextScene file and can be:
- meshes in 3MX or 3SM format
- point clouds in OPC or POD format

The result of a ground extraction is a segmented point cloud with 2 classes : ground and non-ground
Export formats are : *OPC*, *POD*, *LAS* or *LAZ*

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we will create a specification for submitting an Extract Ground job to detect ground in point clouds.

.. literalinclude:: eg_specs_detect_ground_pc.py
  :language: Python

In this example, we will create a specification for submitting an Extract Ground job to detect ground in meshes.

.. literalinclude:: eg_specs_detect_ground_meshes.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.extract_ground

.. autopydantic_model:: ExtractGroundSpecificationsCreate

.. autoclass:: ExtractGroundOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: ExtractGroundSpecifications

.. autopydantic_model:: ExtractGroundInputs
    :model-show-json: False

.. autopydantic_model:: ExtractGroundOutputs
    :model-show-json: False

.. autopydantic_model:: ExtractGroundOptions
    :model-show-json: False