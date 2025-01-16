===========
Constraints
===========

The *Constraints* jobs allows you to add or remove constraints to or from a Reference Model.
A constraint is a geometric object (currently a mesh or a polygon) that will constrain the geometry of the Reference Model.

.. contents:: Quick access
   :local:
   :depth: 2

Reference Model
===============

In the Reference Model, constraints information is stored in ``constraints\constraints.json``.
The schema for that file is documented in :class:`reality_capture.specifications.constraints.ConstraintsInfo`.

Examples
========

In this example, we will create a specification for submitting a constraints job that adds a constraint to a reference model.

.. literalinclude:: constraints_specs_add.py
  :language: Python

In this example, we will create a specification for submitting a constraints job that deletes a constraint from a reference model.

.. literalinclude:: constraints_specs_delete.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.constraints

.. autopydantic_model:: ConstraintsSpecificationsCreate

.. autoclass:: ConstraintsOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: ConstraintsSpecifications

.. autopydantic_model:: ConstraintsInputs
    :model-show-json: False

.. autopydantic_model:: ConstraintsOutputs
    :model-show-json: False

.. autopydantic_model:: ConstraintToAdd
    :model-show-json: False

.. autoclass:: ConstraintType
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: ConstraintsInfo

.. autopydantic_model:: ConstraintInfo
    :model-show-json: False
    :inherited-members: BaseModel
