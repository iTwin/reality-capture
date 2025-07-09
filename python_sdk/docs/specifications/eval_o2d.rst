===============
Eval Objects 2D
===============

The *Eval Objects 2D* job allows you to compare two sets of 2D objects annotations : the prediction and the reference.
It will generate a json report, containing the number of true positives (TP), false negatives (FN) and false positives (FP) for each class.
It will also generate an annotated and classified scene. Each object has a class, but has also an extra value for its classification (i.e TP, FN, FP).

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we will create a specification for submitting an Eval Objects 2D job to compare 2D objects annotations.

.. literalinclude:: examples/eval_o2d_specs.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.eval_o2d

.. autopydantic_model:: EvalO2DSpecificationsCreate

.. autoclass:: EvalO2DOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: EvalO2DSpecifications

.. autopydantic_model:: EvalO2DInputs
    :model-show-json: False

.. autopydantic_model:: EvalO2DOutputs
    :model-show-json: False

.. autopydantic_model:: EvalO2DOptions
    :model-show-json: False