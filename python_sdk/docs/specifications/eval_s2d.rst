====================
Eval Segmentation 2D
====================

The *Eval Segmentation 2D* job allows you to compare two sets of 2D segmentations : the prediction and the reference.
It will generate a json report, containing a confusion matrix. The size of the confusion matrix is c\ :sup:`2`, where c is the number of classes.
It will also generate a scene, pointing to the segmented photos and the corresponding segmented photos.
The number of classes in the segmented photos is c\ :sup:`2`.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we will create a specification for submitting an Eval Segmentation 2D job to compare 2D segmentations.

.. literalinclude:: examples/eval_s2d_specs.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.eval_s2d

.. autopydantic_model:: EvalS2DSpecificationsCreate

.. autoclass:: EvalS2DOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: EvalS2DSpecifications

.. autopydantic_model:: EvalS2DInputs
    :model-show-json: False

.. autopydantic_model:: EvalS2DOutputs
    :model-show-json: False
