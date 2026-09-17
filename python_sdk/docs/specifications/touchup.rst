=======
Touchup
=======

The *Touchup* jobs allows you to export parts of the Reference Model for modifications, and reimport the modifications into the Reference Model.

.. contents:: Quick access
   :local:
   :depth: 2

Tiles
=====

You can specify which tiles to touch up in this job.
To know the tile names and their extent, you can read the ``layout.json``, as explained in the :doc:`/specifications/tiling` section.

Import details
==============
If you asked for the ImportInfo output, a file will be created inside the bucket with the name ``touchupImport.json``.
The schema is documented in :class:`reality_capture.specifications.touchup.ImportInfo`.

Examples
========

In this example, we will create a specification for submitting an export touch up job for one tile of a modeling reference.

.. literalinclude:: examples/touchup_export.py
  :language: Python

In this example, we will create a specification for submitting an import touch up job.

.. literalinclude:: examples/touchup_import.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.touchup

.. autopydantic_model:: TouchUpExportSpecificationsCreate
    :inherited-members: BaseModel

.. autoclass:: TouchUpExportOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: TouchUpExportSpecifications
    :inherited-members: BaseModel

.. autopydantic_model:: TouchUpExportInputs
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: TouchUpExportOptions
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: TouchUpExportOutputs
    :inherited-members: BaseModel
    :model-show-json: False

.. autoclass:: TouchLevel
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: TouchUpImportSpecificationsCreate
    :inherited-members: BaseModel

.. autoclass:: TouchUpImportOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: TouchUpImportSpecifications
    :inherited-members: BaseModel

.. autopydantic_model:: TouchUpImportInputs
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: TouchUpImportOutputs
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: ImportInfo
    :inherited-members: BaseModel

.. autopydantic_model:: ImportTileInfo
    :inherited-members: BaseModel
    :model-show-json: False
