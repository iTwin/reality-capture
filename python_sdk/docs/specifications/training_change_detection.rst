=========================
Training Change Detection
=========================

The *Training Change Detection* job uses pairs of segmented point clouds, capturing the same area at two different times (A and B), to train a new point cloud change detector. The trained detector can then be used by the :doc:`/specifications/change_detection` job to detect changes between two other point clouds.

.. contents:: Quick access
   :local:
   :depth: 2

Purpose
=======

.. list-table::
   :widths: auto
   :header-rows: 1

   * - Purpose
     - Inputs
     - Possible outputs
     - Useful options
   * - | Train a new change detector
       | on pairs of segmented
       | point clouds (ContextScenes)
     - | *segmentation3DPairs*,
       | *detectorName*,
       | *preset* (optional)
     - | *detector*
     - | *epochs*,
       | *spacing*,
       | *model*,
       | *features*,
       | *versionNumber*

Each pair references a ContextScene at time A (``segmentation3DA``) and a ContextScene at time B (``segmentation3DB``). Each ContextScene must contain exactly one Segmentation3D annotation referencing one point cloud, and both ContextScenes of a pair must use the same spatial reference system. All ContextScenes must declare the same labels: these are the classes the detector learns to predict.

Once the job is done, the ``detector`` output holds the trained detector as ``name/version``. Use it as the ``pointCloudChangeDetector`` input of a :doc:`/specifications/change_detection` job.

.. attention::

   Only the ``RGB`` feature is currently supported: ``NORMAL`` and ``INTENSITY`` are rejected.

Examples
========

In this example, we will create a specification for submitting a Training Change Detection job to produce a new change detector from two pairs of segmented point clouds.

.. literalinclude:: examples/training_cd_default.py
  :language: Python

In this example, we will create the same specification with training options.

.. literalinclude:: examples/training_cd_options.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.training

.. autopydantic_model:: TrainingChangeDetectionSpecificationsCreate

.. autoclass:: TrainingChangeDetectionOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: TrainingChangeDetectionSpecifications

.. autopydantic_model:: TrainingChangeDetectionInputs
    :model-show-json: False

.. autopydantic_model:: Segmentation3DPair
    :model-show-json: False

.. autopydantic_model:: TrainingChangeDetectionOutputs
    :model-show-json: False

.. autopydantic_model:: TrainingChangeDetectionOptions
    :model-show-json: False

.. autoclass:: ChangeDetectionTrainingModel
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: ChangeDetectionPointCloudFeature
    :show-inheritance:
    :members:
    :undoc-members:
