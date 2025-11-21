===============
Eval Objects 3D
===============

The *Eval Objects 3D* job allows you to compare two sets of 3D objects annotations : the prediction and the reference.
It will generate a json report, containing the number of true positives (TP), false negatives (FN) and false positives (FP) for each class.
It will also generate an annotated and classified scene. Each object has a class, but has also an extra value for its classification (i.e TP, FN, FP).

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we will create a specification for submitting an Eval Objects 3D job to compare 3D objects annotations.

.. literalinclude:: examples/eval_o3d_specs.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.eval_o3d

.. autopydantic_model:: EvalO3DSpecificationsCreate

.. autoclass:: EvalO3DOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: EvalO3DSpecifications

.. autopydantic_model:: EvalO3DInputs
    :model-show-json: False

.. autopydantic_model:: EvalO3DOutputs
    :model-show-json: False

.. autopydantic_model:: EvalO3DOptions
    :model-show-json: False