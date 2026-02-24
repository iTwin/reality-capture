=============
Mesh sampling
=============

The *mesh sampling* job takes one or multiple reality data meshes as an input and will sample and consolidate them into a single point cloud.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we create a specification for submitting a mesh sampling job to 3D Tiles format:

.. literalinclude:: examples/mesh_sampling_specs.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.mesh_sampling

.. autopydantic_model:: MeshSamplingSpecificationsCreate

.. autopydantic_model:: MeshSamplingSpecifications

.. autopydantic_model:: MeshSamplingInputs
    :model-show-json: False

.. autopydantic_model:: MeshSamplingOptions
    :model-show-json: False

.. autoclass:: MeshSamplingFormat
    :show-inheritance:
    :members:
    :undoc-members:
