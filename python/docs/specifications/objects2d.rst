==========
Objects 2D
==========

The *Objects 2D* job uses a photo object detector to detect 2D objects in photos. This job produces a context scene annotated with 2D objects. 
If the context scene input is oriented, it can turn these 2D objects into 3D objects and produce a context scene annotated with 3D objects. 
Optionally, these 3D objects that can be exported in another formats, such as 3D Tiles, DGN, SHP, or GeoJSON.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, .

In this example, .

Classes
=======

.. currentmodule:: reality_capture.specifications.objects2d

.. autopydantic_model:: Objects2DSpecificationsCreate

.. autoclass:: Objects2DOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: Objects2DSpecifications

.. autopydantic_model:: Objects2DInputs
    :model-show-json: False

.. autopydantic_model:: Objects2DOutputs
    :model-show-json: False

.. autopydantic_model:: Objects2DOptions
    :model-show-json: False