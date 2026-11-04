================
Change Detection
================

The Change Detection job detects changes between two collections of point clouds or meshes. It produces a context annotated with 3D objects, capturing the regions with changes. Optionally, the context scene output can be exported as SHP or GeoJSON files.

The job can also use a point cloud change detector, trained with the :doc:`/specifications/training_change_detection` job. This ML model classifies each point of both point clouds with the labels it was trained on, and the job produces the segmented point clouds and the context scenes pointing to them.

.. contents:: Quick access
   :local:
   :depth: 2

Purposes
========

This job has two different purposes:

.. list-table::
   :widths: 25 25 25 25
   :header-rows: 1

   * - Purpose
     - Inputs
     - Possible outputs
     - Useful options
   * - | Detect changes between
       | two collections of
       | point clouds or meshes
     - | *model3DA*,
       | *model3DB*,
       | *extent* (optional),
       | *preset* (optional)
     - | *locations3DA*,
       | *locations3DAAsSHP*,
       | *locations3DAAsGeoJSON*,
       | *locations3DB*,
       | *locations3DBAsSHP*,
       | *locations3DBAsGeoJSON*,
       | *segmentation3DA*,
       | *segmentedModel3DA*,
       | *segmentation3DB*,
       | *segmentedModel3DB*
     - | *minPointsPerChange*,
       | *samplingResolution*,
       | *growThreshold*,
       | *filterThreshold*
   * - | Classify the points of
       | two point clouds with a
       | trained change detector
     - | *model3DA*,
       | *model3DB*,
       | *pointCloudChangeDetector*
     - | *segmentation3DA*,
       | *segmentedModel3DA*,
       | *segmentation3DB*,
       | *segmentedModel3DB*
     -

Examples
========

In this example, we will create a specification for submitting a Change Detection job to detect changes (3d objects) between two meshes.

.. literalinclude:: examples/cd_specs_detect_changes_meshes.py
  :language: Python

In this example, we will create a specification for submitting a Change Detection job to classify the points of two point clouds with a change detector from the AI Detectors library, such as one trained with the :doc:`/specifications/training_change_detection` job.

.. literalinclude:: examples/cd_specs_detect_changes_with_detector.py
  :language: Python

.. attention::

   With a ``pointCloudChangeDetector``, ``model3DA`` and ``model3DB`` must be ContextScenes, each pointing to exactly one point cloud, in the same spatial reference system. The ``extent`` and ``preset`` inputs, the options and the ``locations3D*`` outputs are not supported.

   ``SEGMENTATION3D_A`` requires ``SEGMENTED_MODEL3D_A`` to be produced as well, and ``SEGMENTATION3D_B`` requires ``SEGMENTED_MODEL3D_B``.


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