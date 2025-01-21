================
Change Detection
================

The Change Detection job detects changes between two collections of point clouds or meshes. It produces a context annotated with 3D objects, capturing the regions with changes. optionalionally, the context scene output can be exported as SHP or GeoJSON files.

.. contents:: Quick access
   :local:
   :depth: 2

Purposes
========

This job has two different purposes :

.. list-table:: Purposes
   :widths: 25 25 25 25
   :header-rows: 1

   * - Purpose
     - Inputs
     - Possible outputs
     - Useful options
   * - Detect changes between two collections of point clouds
     - | *pointClouds1*,
       | *pointClouds2*
     - | *objects3D*
       | *exportedLocations3DSHP* (optional),
       | *exportedLocations3DGeoJSON* (optional)
     - | *exportSrs*,
       | *colorThresholdLow*,
       | *colorThresholdHigh*,
       | *distThresholdLow*,
       | *distThresholdHigh*,
       | *minPoints*
   * - Detect changes between two collections of meshes
     - | *meshes1*,
       | *meshes2*
     - | *objects3D*,
       | *exportedLocations3DSHP* (optional),
       | *exportedLocations3DGeoJSON* (optional)
     - | *resolution*,
       | *exportSrs*,
       | *colorThresholdLow*,
       | *colorThresholdHigh*
       | *distThresholdLow*
       | *distThresholdHigh*
       | *minPoints*

Examples
========

In this example, we will create a specification for submitting a Change Detection job to detect changes (3d objects) between two point clouds.

.. literalinclude:: cd_specs_detect_changes_pc.py
  :language: Python

In this example, we will create a specification for submitting a Change Detection job to detect changes (3d objects) between two meshes.

.. literalinclude:: cd_specs_detect_changes_meshes.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.change_detection

.. autopydantic_model:: ChangeDetectionSpecificationsCreate

.. autoclass:: ChangeDetectionOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: ChangeDetectionSpecifications

.. autopydantic_model:: ChangeDetectionInputs
    :model-show-json: False

.. autopydantic_model:: ChangeDetectionOutputs
    :model-show-json: False

.. autopydantic_model:: ChangeDetectionOptions
    :model-show-json: False