=====================
Clearance Calculation
=====================

The *Clearance calculation* job allows you to compute clearance information for various structures (e.g. bridges).


.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we will create a specification for submitting a clearance computation job.

.. literalinclude:: examples/clearance_specs.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.clearance

.. autopydantic_model:: ClearanceSpecificationsCreate

.. autoclass:: ClearanceOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: ClearanceSpecifications

.. autopydantic_model:: ClearanceInputs
    :model-show-json: False

.. autopydantic_model:: ClearanceOutputs
    :model-show-json: False
