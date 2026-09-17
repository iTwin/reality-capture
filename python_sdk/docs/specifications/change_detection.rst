================
Change Detection
================

The Change Detection job detects changes between two collections of point clouds or meshes. It produces a context annotated with 3D objects, capturing the regions with changes. optionalionally, the context scene output can be exported as SHP or GeoJSON files.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we will create a specification for submitting a Change Detection job to detect changes (3d objects) between two meshes.

.. literalinclude:: examples/cd_specs_detect_changes_meshes.py
  :language: Python


Classes
=======

.. currentmodule:: reality_capture.specifications.change_detection

.. autopydantic_model:: ChangeDetectionSpecificationsCreate
    :inherited-members: BaseModel

.. autoclass:: ChangeDetectionOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: ChangeDetectionSpecifications
    :inherited-members: BaseModel

.. autopydantic_model:: ChangeDetectionInputs
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: ChangeDetectionOutputs
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: ChangeDetectionOptions
    :inherited-members: BaseModel
    :model-show-json: False