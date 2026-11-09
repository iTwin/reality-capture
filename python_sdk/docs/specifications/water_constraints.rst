=================
Water Constraints
=================

The *Water Constraints* job allows you to detect water area such as rivers, lakes or sea in a Reference Model.
It produces a constraint that can be imported into the Reference Model with a :doc:`/specifications/constraints` job.
The produced constraint has the ``enuDefinition`` coordinate systems defined in the Reference Model ``layout.json``.
See the :doc:`/specifications/tiling` section for more details.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we will create a specification for submitting a water constraints job.

.. literalinclude:: examples/water_constraints_specs.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.water_constraints

.. autopydantic_model:: WaterConstraintsSpecificationsCreate
    :inherited-members: BaseModel

.. autoclass:: WaterConstraintsOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: WaterConstraintsSpecifications
    :inherited-members: BaseModel

.. autopydantic_model:: WaterConstraintsInputs
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: WaterConstraintsOutputs
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: WaterConstraintsOptions
    :inherited-members: BaseModel
    :model-show-json: False
