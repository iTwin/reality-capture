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

.. list-table::
   :widths: 25 25 25 25
   :header-rows: 1

   * - Purpose
     - Inputs
     - Possible outputs
     - Useful options
   * - Segmentation of photos
     - | *photos*,
       | *photo_segmentation_detector*
     - | *segmentation2d*,
       | *segmented_photos*
     - |
   * - | Segment oriented photos
       | and project segmentation
       | on a collection of meshes
       | or point clouds and detect
       | 3D lines and 3D polygons
     - | *photos*,
       | *photo_segmentation_detector*,
       | *point_clouds*/*meshes*
     - | *segmentation2d*,
       | *segmented_photos*,
       | *lines3d* (optional),
       | *lines3d_as_dgn* (optional),
       | *lines3d_as_3d_tiles* (optional),
       | *lines3d_as_geojson* (optional),
       | *polygons3d* (optional),
       | *polygons3d_as_dgn* (optional),
       | *polygons3d_as_3d_tiles* (optional),
       | *polygons3d_as_geojson* (optional)
     - | *min_photos*,
       | *crs*,
       | *remove_small_components*,
       | *compute_line_width*
   * - | Given a 2D segmentation of
       | oriented photos, project
       | segmentation on a collection
       | of meshes or point clouds
       | and detect 3D lines and 3D polygons
     - | *photos*,
       | *segmentation2d*,
       | *point_clouds*/*meshes*
     - | *lines3d* (optional),
       | *lines3d_as_dgn* (optional),
       | *lines3d_as_3d_tiles* (optional),
       | *lines3d_as_geojson* (optional),
       | *polygons3d* (optional),
       | *polygons3d_as_dgn* (optional),
       | *polygons3d_as_3d_tiles* (optional),
       | *polygons3d_as_geojson* (optional)
     - | *min_photos*,
       | *crs*,
       | *remove_small_components*,
       | *compute_line_width*

Examples
========

In this example, we will create a specification for submitting a Segmentation 2D job to segment photos.

.. literalinclude:: examples/s2d_specs_segment_photos.py
  :language: Python

In this example, we will create a specification for submitting a Segmentation 2D job to segment oriented photos and project segmentation on a collection of meshes or point clouds

.. literalinclude:: examples/s2d_specs_segment_photos_and_project_on_mesh.py
  :language: Python

In this example, we will create a specification for submitting a Segmentation 2D job to project segmentation on a collection of meshes or point clouds, given a 2D segmentation of oriented photos.

.. literalinclude:: examples/s2d_specs_project_on_mesh_given_2d_segmentation.py
  :language: Python

.. attention::

   Some outputs requires other outputs to be specified in order to be produced. For example, ``LINES3D_AS_GEOJSON`` requires ``LINES3D`` to be produced as well.


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