============================
Eval Segmentation Orthophoto
============================

The *Eval Segmentation Orthophoto* job allows you to compare two sets of 2D orthophoto segmentations : the prediction and the reference.
It will generate a json report, containing a confusion matrix. The size of the confusion matrix is c\ :sup:`2`, where c is the number of classes.
It will also generate a scene, pointing to the segmented photos and the corresponding segmented photos.
The number of classes in the segmented photos is c\ :sup:`2`.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we will create a specification for submitting an Eval Orthophoto Segmentation job to compare orthophoto segmentations.

.. literalinclude:: examples/eval_sortho_specs.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.eval_sortho

.. autopydantic_model:: EvalSOrthoSpecificationsCreate

.. autoclass:: EvalSOrthoOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: EvalSOrthoSpecifications

.. autopydantic_model:: EvalSOrthoInputs
    :model-show-json: False

.. autopydantic_model:: EvalSOrthoOutputs
    :model-show-json: False
