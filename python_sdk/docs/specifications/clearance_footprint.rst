===================
Clearance Footprint
===================

The *Clearance Footprint* job allows you to project one class footprint onto another one.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we will create a specification for submitting a Clearance Footprint job.

.. literalinclude:: examples/clearance_footprint_specs.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.clearance_footprint

.. autopydantic_model:: ClearanceFootprintSpecificationsCreate

.. autoclass:: ClearanceFootprintOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: ClearanceFootprintSpecifications

.. autopydantic_model:: ClearanceFootprintInputs
    :model-show-json: False

.. autopydantic_model:: ClearanceFootprintOutputs
    :model-show-json: False

.. autopydantic_model:: ClearanceFootprintOptions
    :model-show-json: False
