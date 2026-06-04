============
Training O2D
============

The *Training O2D* job uses a ContextScene containing Objects2D annotations of pictures to train a new O2D detector.

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
       | *metrics* (optional)
     - | *epochs*
       | *max_train_split*


Examples
========

In this example, we will create a specification for submitting a Training O2D job to produce a new O2D detector from a ContextScene.

.. literalinclude:: examples/training_o2d_new_default.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.training

.. autopydantic_model:: TrainingO2DSpecificationsCreate

.. autoclass:: TrainingO2DOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: TrainingO2DSpecifications

.. autopydantic_model:: TrainingO2DInputs
    :model-show-json: False

.. autopydantic_model:: TrainingO2DOutputs
    :model-show-json: False

.. autopydantic_model:: TrainingO2DOptions
    :model-show-json: False
