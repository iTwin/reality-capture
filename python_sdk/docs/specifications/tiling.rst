======
Tiling
======

The *Tiling* job allows you to initialize a modeling reference with a specific layout and settings.
This is the ground work before submitting productions.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========
In this example, we will create a specification for submitting a tiling job with default options.

.. literalinclude:: examples/tiling_specs_default.py
  :language: Python

In this example, we will add options to our specification and specify the path to a region of interest.

.. literalinclude:: examples/tiling_specs_options.py
  :language: Python

Region of Interest
==================

As an input for a Tiling job, you can specify a Region of Interest.
It will define the region for the tiling, and will be the default extent for subsequent exports.
It is a ``JSON`` file documented in :class:`reality_capture.specifications.geometry.RegionOfInterest`.

Modeling Reference
==================

The Tiling job creates and initializes a Modeling Reference. Among other files, the Modeling Reference contains a ``layout.json`` file that describes the tiling layout.
This information can be useful in subsequent jobs such as Touchup jobs.
The schema for that file is documented in :class:`reality_capture.specifications.tiling.Layout`.

Classes
=======

.. currentmodule:: reality_capture.specifications.tiling

.. autopydantic_model:: TilingSpecificationsCreate

.. autoclass:: TilingOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: TilingSpecifications

.. autopydantic_model:: TilingInputs
    :model-show-json: False

.. autopydantic_model:: TilingOutputs
    :model-show-json: False

.. autopydantic_model:: ModelingReference
    :model-show-json: False

.. autopydantic_model:: TilingOptions
    :model-show-json: False

.. autoclass:: ModelingReferenceType
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: TilingMode
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: GeometricPrecision
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: TilingPairSelection
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: PhotoUsedForGeometry
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: HoleFilling
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: Simplification
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: ColorCorrection
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: UntexturedRepresentation
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: PointCloudColorSource
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: TextureSource
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: Layout

.. autopydantic_model:: LayoutTile
    :model-show-json: False