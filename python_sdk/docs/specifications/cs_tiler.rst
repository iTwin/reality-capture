==================
ContextScene Tiler
==================

The *ContextScene Tiler* job allows you to transform a part of a ContextScene to 3D Tiles for viewing purposes.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we will create a specification for submitting a ContextScene Tiler job tiling Cameras.

.. literalinclude:: examples/cs_tiler_specs.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.cs_tiler

.. autopydantic_model:: ContextSceneTilerSpecificationsCreate

.. autopydantic_model:: ContextSceneTilerSpecifications

.. autopydantic_model:: CSTilerInputs
    :model-show-json: False

.. autopydantic_model:: CSTilerOptions
    :model-show-json: False

.. autoclass:: CSObject
    :show-inheritance:
    :members:
    :undoc-members:
