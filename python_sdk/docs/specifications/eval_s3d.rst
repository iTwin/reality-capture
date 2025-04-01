====================
Eval Segmentation 3D
====================

The *Eval Segmentation 3D* job allows you to compare two sets of 3D segmentations : the prediction and the reference.
It will generate a json report, containing a confusion matrix. The size of the confusion matrix is c\ :sup:`2`, where c is the number of classes.
It will also generates a scene, pointing to the segmented point cloud and the corresponding segmented point cloud.
The number of classes in the segmented point cloud is c\ :sup:`2`.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we will create a specification for submitting an Eval Segmentation 3D job to compare 3D segmentations.

.. literalinclude:: examples/eval_s3d_specs.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.eval_s3d

.. autopydantic_model:: EvalS3DSpecificationsCreate

.. autoclass:: EvalS3DOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: EvalS3DSpecifications

.. autopydantic_model:: EvalS3DInputs
    :model-show-json: False

.. autopydantic_model:: EvalS3DOutputs
    :model-show-json: False