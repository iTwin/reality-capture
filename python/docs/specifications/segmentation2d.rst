===============
Segmentation 2D
===============

The Segmentation 2D job uses a photo segmentation detector to classify pixels in photos. If photos are oriented, it can project the segmentation on meshes or point clouds, and detect 3D lines and 3D polygons. This job produces segmented photos and a context scene pointing to these photos. Optionally, it can also produce context scenes annotated with 3D polygons and 3D lines. Those can be exported in another formats, such as 3D Tiles, DGN, or GeoJSON.

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
   * - Segmentation of photos
     - | *photos*,
       | *photoSegmentationDetector*
     - | *segmentation2D*,
       | *segmentedPhotos*
     - |
   * - | Segment oriented photos and project segmentation on a collection of meshes
       | or point clouds and detect 3D lines and 3D polygons
     - | *photos*,
       | *photoSegmentationDetector*,
       | *pointClouds*/*meshes*
     - | *segmentation2D*,
       | *segmentedPhotos*,
       | *lines3D* (optional),
       | *exportedLines3DDGN* (optional),
       | *exportedLines3DCesium* (optional),
       | *exportedLines3DGeoJSON* (optional),
       | *polygons3D* (optional),
       | *exportedPolygons3DDGN* (optional),
       | *exportedPolygons3DCesium* (optional),
       | *exportedPolygons3DGeoJSON* (optional)
     - | *minPhotos*,
       | *exportSrs*,
       | *removeSmallComponents*,
       | *computeLineWidth*
   * - | Given a 2D segmentation of oriented photos, project segmentation on a collection of meshes
       | or point clouds and detect 3D lines and 3D polygons
     - | *photos*,
       | *segmentation2D*,
       | *pointClouds*/*meshes*
     - | *lines3D* (optional),
       | *exportedLines3DDGN* (optional),
       | *exportedLines3DCesium* (optional),
       | *exportedLines3DGeoJSON* (optional),
       | *polygons3D* (optional),
       | *exportedPolygons3DDGN* (optional),
       | *exportedPolygons3DCesium* (optional),
       | *exportedPolygons3DGeoJSON* (optional)
     - | *minPhotos*,
       | *exportSrs*,
       | *removeSmallComponents*,
       | *computeLineWidth*

Examples
========

In this example, we will create a specification for submitting a Segmentation 2D job to segment photos.

.. literalinclude:: s2d_specs_segment_photos.py
  :language: Python

In this example, we will create a specification for submitting a Segmentation 2D job to segment oriented photos and project segmentation on a collection of meshes or point clouds

.. literalinclude:: s2d_specs_segment_photos_and_project_on_mesh.py
  :language: Python

In this example, we will create a specification for submitting a Segmentation 2D job to project segmentation on a collection of meshes or point clouds, given a 2D segmentation of oriented photos.

.. literalinclude:: s2d_specs_project_on_mesh_given_2d_segmentation.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.segmentation2d

.. autopydantic_model:: Segmentation2DSpecificationsCreate

.. autoclass:: Segmentation2DOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: Segmentation2DSpecifications

.. autopydantic_model:: Segmentation2DInputs
    :model-show-json: False

.. autopydantic_model:: Segmentation2DOutputs
    :model-show-json: False

.. autopydantic_model:: Segmentation2DOptions
    :model-show-json: False