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

Examples
========

In this example, we will create a specification for submitting an export touch up job for one tile of a reference model.

.. literalinclude:: examples/touchup_export.py
  :language: Python

In this example, we will create a specification for submitting an import touch up job.

.. literalinclude:: examples/touchup_import.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.touchup

.. autopydantic_model:: TouchUpExportSpecificationsCreate

.. autoclass:: TouchUpExportOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: TouchUpExportSpecifications

.. autopydantic_model:: TouchUpExportInputs
    :model-show-json: False

.. autopydantic_model:: TouchUpExportOptions
    :model-show-json: False

.. autopydantic_model:: TouchUpExportOutputs
    :model-show-json: False

.. autoclass:: TouchFormat
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: TouchLevel
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: TouchUpImportSpecifications

.. autopydantic_model:: TouchUpImportInputs
    :model-show-json: False
