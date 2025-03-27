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

.. list-table::
   :widths: 25 25 25 25
   :header-rows: 1

   * - Purpose
     - Inputs
     - Possible outputs
     - Useful options
   * - | Detect changes between
       | two collections of
       | point clouds
     - | *point_clouds1*,
       | *point_clouds2*
     - | *objects3d*
       | *locations3d_as_shp* (optional),
       | *locations3d_as_geojson* (optional)
     - | *crs*,
       | *color_threshold_low*,
       | *color_threshold_high*,
       | *dist_threshold_low*,
       | *dist_threshold_high*,
       | *min_points*
   * - | Detect changes between
       | two collections of
       | meshes
     - | *meshes1*,
       | *meshes2*
     - | *objects3d*,
       | *locations3d_as_shp* (optional),
       | *locations3d_as_geojson* (optional)
     - | *resolution*,
       | *crs*,
       | *color_threshold_low*,
       | *color_threshold_high*
       | *dist_threshold_low*
       | *dist_threshold_high*
       | *min_points*

Examples
========

In this example, we will create a specification for submitting a Change Detection job to detect changes (3d objects) between two point clouds.

.. literalinclude:: examples/cd_specs_detect_changes_pc.py
  :language: Python

In this example, we will create a specification for submitting a Change Detection job to detect changes (3d objects) between two meshes.

.. literalinclude:: examples/cd_specs_detect_changes_meshes.py
  :language: Python

.. attention::

   Some outputs requires other outputs to be specified in order to be produced. For example, ``LOCATIONS3D_AS_GEOJSON`` requires ``OBJECTS3D`` to be produced as well.


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