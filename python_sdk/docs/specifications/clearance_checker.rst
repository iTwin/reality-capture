=================
Clearance Checker
=================

The *Clearance Checker* job allows you to compute clearance information given a 3D model and footprints.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we will create a specification for submitting a Clearance Checker job.

.. literalinclude:: examples/clearance_checker_specs.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.clearance_checker

.. autopydantic_model:: ClearanceCheckerSpecificationsCreate

.. autoclass:: ClearanceCheckerOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: ClearanceCheckerSpecifications

.. autopydantic_model:: ClearanceCheckerInputs
    :model-show-json: False

.. autopydantic_model:: ClearanceCheckerOutputs
    :model-show-json: False
