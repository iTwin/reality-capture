==============
Reconstruction
==============

The *Reconstruction* job combines the :doc:`/specifications/tiling` and :doc:`/specifications/production` jobs into a single one.
Please check these jobs in case you need more information about inputs or outputs.

If the Reference Model is specified as an input, it can not be specified as an output and the TilingOptions are to be left empty.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========
In this example, we will we will create a specification for submitting a job reconstructing a modeling reference and a 3D tiles export.

.. literalinclude:: examples/reconstruction_specs.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.reconstruction

.. autopydantic_model:: ReconstructionSpecificationsCreate
    :inherited-members: BaseModel

.. autopydantic_model:: ReconstructionOutputsCreate
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: ReconstructionSpecifications
    :inherited-members: BaseModel

.. autopydantic_model:: ReconstructionInputs
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: ReconstructionOutputs
    :inherited-members: BaseModel
    :model-show-json: False
