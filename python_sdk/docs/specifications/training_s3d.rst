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
     - | *scene*,
     - | *detector*,
     - | *epochs*
       | *max_train_split*


Examples
========

In this example, we will create a specification for submitting a Training S3D job to produce a new S3D detector from a ContextScene.

.. literalinclude:: examples/training_s3d_new_default.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.training

.. autopydantic_model:: TrainingS3DSpecificationsCreate

.. autoclass:: TrainingS3DOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: TrainingS3DSpecifications

.. autopydantic_model:: TrainingS3DInputs
    :model-show-json: False

.. autopydantic_model:: TrainingS3DOutputs
    :model-show-json: False

.. autopydantic_model:: TrainingS3DOptions
    :model-show-json: False
