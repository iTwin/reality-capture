==========
Objects 2D
==========

The *Objects 2D* job uses a photo object detector to detect 2D objects in photos. This job produces a context scene annotated with 2D objects. 
If the context scene input is oriented, it can turn these 2D objects into 3D objects and produce a context scene annotated with 3D objects. 
Optionally, these 3D objects that can be exported in another formats, such as 3D Tiles, DGN, SHP, or GeoJSON.

.. contents:: Quick access
   :local:
   :depth: 2

Purposes
========

This job has three different purposes :

.. list-table:: Purposes
   :widths: 25 25 25 25
   :header-rows: 1

   * - Purpose
     - Inputs
     - Possible outputs
     - Useful options
   * - Detect object in photos
     - | *photos*,
       | *photoObjectDetector*
     - | *objects2D*
     - |
   * - Detect objects in oriented photos and infer 3D objects
     - | *photos*,
       | *photoObjectDetector*,
       | *pointClouds* (optional),
       | *meshes* (optional)
     - | *objects2D*,
       | *objects3D*,
       | *exportedObjects3DDGN* (optional),
       | *exportedObjects3DCesium* (optional),
       | *exportedObjects3DGeoJSON* (optional),
       | *exportedLocations3DSHP* (optional),
       | *exportedLocations3DGeoJSON* (optional)
     - | *exportSrs*,
       | *minPhotos*,
       | *maxDist*,
       | *useTiePoints*
   * - Given 2D objects in oriented photos, infer 3D objects
     - | *photos*,
       | *objects2D*,
       | *pointClouds* (optional),
       | *meshes* (optional)
     - | *objects3D*,
       | *exportedObjects3DDGN* (optional),
       | *exportedObjects3DCesium* (optional),
       | *exportedObjects3DGeoJSON* (optional),
       | *exportedLocations3DSHP* (optional),
       | *exportedLocations3DGeoJSON* (optional)
     - | *exportSrs*,
       | *minPhotos*,
       | *maxDist*,
       | *useTiePoints*

Examples
========

In this example, we will create a specification for submitting an Objects 2D job to detect object in photos using a detector.

.. literalinclude:: o2d_specs_detect_o2d_objects.py
  :language: Python

In this example, we will create a specification for submitting an Objects 2D job to detect objects in oriented photos and infer 3D objects.

.. literalinclude:: o2d_specs_detect_o2d_and_o3d_objects.py
  :language: Python

In this example, we will create a specification for submitting an Objects 2D job to infer 3D objects given 2D objects in oriented photos.

.. literalinclude:: o2d_specs_detect_o3d_objects_given_o2d_objects.py
  :language: Python

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