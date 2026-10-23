============
Training S3D
============

The *Training S3D* job uses a ContextScene containing annotated pointclouds to train a new S3D detector.

.. contents:: Quick access
   :local:
   :depth: 2

Purpose
=======

  This job has the following purposes:


.. list-table::
   :widths: auto
   :header-rows: 1

   * - Purpose
     - Inputs
     - Possible outputs
     - Useful options
   * - Train new detector on a dataset (ContextScene)
     - | *segmentations3D*,
       | *detectorName*,
       | *preset* (optional)
     - | *detector*,
     - | *epochs*
       | *spacing*
       | *versionNumber*

Examples
========

In this example, we will create a specification for submitting a Training S3D job to produce a new S3D detector from a ContextScene.

.. literalinclude:: examples/training_s3d_default.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.training

.. autopydantic_model:: TrainingS3DSpecificationsCreate
    :inherited-members: BaseModel

.. autoclass:: TrainingS3DOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: TrainingS3DSpecifications
    :inherited-members: BaseModel

.. autopydantic_model:: TrainingS3DInputs
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: TrainingS3DOutputs
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: TrainingS3DOptions
    :inherited-members: BaseModel
    :model-show-json: False
