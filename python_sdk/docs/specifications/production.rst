==========
Production
==========

The *Production* job allows you to export a Reference Model to a 3D mesh, a 3D point cloud or a 2D raster.
It is possible to produce multiple exports at once.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we will create a specification for submitting a job producing a 3D tiles export and a raster in GeoTiff.

.. literalinclude:: examples/production_specs_3d_tiles.py
  :language: Python

Extent
======
As an input for a Production job, you can specify an Extent.
It will crop the exports with the region defined.
It is a ``JSON`` file documented in :class:`reality_capture.specifications.geometry.RegionOfInterest`.

Classes
=======

.. currentmodule:: reality_capture.specifications.production

.. autopydantic_model:: ProductionSpecificationsCreate
    :inherited-members: BaseModel

.. autopydantic_model:: ProductionOutputsCreate
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: ExportCreate
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: ProductionSpecifications
    :inherited-members: BaseModel

.. autopydantic_model:: ProductionInputs
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: ProductionOutputs
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: Export
    :model-show-json: False
    :inherited-members: BaseModel

.. autoclass:: Format
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: Options3DTiles
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: OptionsOBJ
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: Options3MX
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: OptionsLAS
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: OptionsPLY
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: OptionsOPC
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: OptionsI3S
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: OptionsOSGB
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: OptionsOrthoDSM
    :inherited-members: BaseModel
    :model-show-json: False

.. autoclass:: ColorSource
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: ThermalUnit
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: LODScope
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: LODType
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: CesiumCompression
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: SamplingStrategy
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: LasCompression
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: ProjectionMode
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: OrthoFormat
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: DSMFormat
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: OverviewType
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: OrthoColorSource
    :show-inheritance:
    :members:
    :undoc-members:
