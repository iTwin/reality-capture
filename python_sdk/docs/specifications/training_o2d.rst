============
Training O2D
============

The *Training O2D* job uses ContextScenes containing images annotated with 2D objects to train a new photo object detector.
The resulting detector can be used with an :doc:`objects2d` job.

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
   * - Train a photo object detector from annotated ContextScenes
     - | *scenes*
       | *detectorName*
       | *preset* (optional)
     - | *detector*
     - | *epochs*
       | *versionNumber*
       | *features*

``scenes`` is the list of scenes to train on, and ``detectorName`` is the name of the detector to train.
An optional ``preset`` supplies the path to a training preset.

All options are optional:

* ``epochs`` is the number of times to iterate over the entire dataset and must be an integer of at least 1.
* ``versionNumber`` is the version string for the newly trained detector, such as ``"1"`` or ``"1.0"``.
* ``features`` selects the image features used for training. Currently, only ``ImageFeature.RGB`` is supported.

When creating a job, request ``TrainingO2DOutputsCreate.DETECTOR`` in the outputs list.
In the returned specification, ``outputs.detector`` contains the full detector information in ``name/version`` form.
Use ``JobType.TRAINING_O2D`` when submitting this specification as a job to the Analysis service.

Examples
========

This example creates a minimal Training O2D specification without a preset or explicit training options.
Replace the example scene identifier with the identifier of your annotated ContextScene.

.. literalinclude:: examples/training_o2d_default.py
  :language: Python

This example configures the number of epochs, detector version, and image features.

.. literalinclude:: examples/training_o2d_options.py
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

.. autoclass:: ImageFeature
    :show-inheritance:
    :members:
    :undoc-members:
