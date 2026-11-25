=================
Mesh optimization
=================

The *mesh optimization* job optimizes mesh data from one or more Reality Data
containers into a single output. The format enum describes the contract;
available conversions depend on the service and worker capabilities.

The initial target is 3D Tiles 1.1 from 3MX, 3SM or OBJ input, including
collections described by a ContextScene. Support for 3D Tiles 2.0 is a
roadmap goal to be confirmed. ``I3S_1.8`` is the format identifier for
the planned I3S 1.8 / SLPK output.

When ``outputFormat`` is omitted or null, the intended execution default is
``3DTiles_1.1``. When ``outputCrs`` is omitted or null, georeferenced inputs
use ECEF and local inputs retain local coordinates. Mixing local and
georeferenced inputs without a known transformation is rejected.

Examples
========

.. literalinclude:: examples/mesh_optimization_specs.py
  :language: Python

Classes
========

.. currentmodule:: reality_capture.specifications.mesh_optimization

.. autopydantic_model:: MeshOptimizationSpecificationsCreate

.. autopydantic_model:: MeshOptimizationSpecifications

.. autopydantic_model:: MeshOptimizationInputs
    :model-show-json: False

.. autopydantic_model:: MeshOptimizationOptions
    :model-show-json: False

.. autoclass:: MeshOptimizationFormat
    :show-inheritance:
    :members:
    :undoc-members:
