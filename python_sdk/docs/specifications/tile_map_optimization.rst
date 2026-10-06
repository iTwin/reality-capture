=====================
Tile map optimization
=====================

The *tile map optimization* job takes one or multiple reality data tile maps as an input and will consolidate them into a single tile map.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we create a specification for submitting a tile map optimization job to XYZ format:

.. literalinclude:: examples/tm_optimization.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.tile_map_optimization

.. autopydantic_model:: TileMapOptimizationSpecificationsCreate

.. autopydantic_model:: TileMapOptimizationSpecifications

.. autopydantic_model:: TileMapOptimizationInputs
    :model-show-json: False

.. autopydantic_model:: TileMapOptimizationOptions
    :model-show-json: False

.. autoclass:: TileMapOptimizationFormat
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: TileMapImageFormat
    :show-inheritance:
    :members:
    :undoc-members:
