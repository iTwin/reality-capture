===============
Segmentation 3D
===============

The Segmentation 3D job uses a point cloud segmentation detector to classify each point of a point cloud. It produces a segmented point cloud (in OPC format) and a context scene pointing to this point cloud. The segmented point cloud can be exported as LAS, LAZ, POD or PLY. Optionally, it can also produce context scenes annotated with 3D objects, 3D polygons and/or 3D lines. Those can be exported in another format, such as 3D Tiles, SHP, DGN, or GeoJSON.

.. contents:: Quick access
   :local:
   :depth: 2

Purposes
========

This job has four different purposes :

.. list-table::
   :widths: 25 25 25 25
   :header-rows: 1

   * - Purpose
     - Inputs
     - Possible outputs
     - Useful options
   * - | Segment a collection
       | of point clouds
     - | *point_clouds*,
       | *point_cloud_segmentation_detector*,
       | *clip_polygon* (optional)
     - | *segmentation3d*,
       | *segmented_point_cloud*,
       | *segmentation3d_as_las* (optional),
       | *segmentation3d_as_laz* (optional),
       | *segmentation3d_as_pod* (optional),
       | *segmentation3d_as_ply* (optional)
     - | *save_confidence*,
       | *srs*
   * - | Segment a collection
       | of meshes
     - | *meshes*,
       | *point_cloud_segmentation_detector*,
       | *clip_polygon* (optional)
     - | *segmentation3d*,
       | *segmented_point_cloud*,
       | *segmentation3d_as_las* (optional),
       | *segmentation3d_as_laz* (optional),
       | *segmentation3d_as_pod* (optional),
       | *segmentation3d_as_ply* (optional)
     - | *save_confidence*,
       | *srs*
   * - | Segment a collection
       | of point clouds or meshes
       | and infer 3D objects,
       | 3D lines and 3D polygons
     - | *point_clouds/meshes*,
       | *point_cloud_segmentation_detector*,
       | *clip_polygon* (optional)
     - | *segmentation3d*,
       | *segmented_point_cloud*,
       | *segmentation3d_as_las* (optional),
       | *segmentation3d_as_laz* (optional),
       | *segmentation3d_as_pod* (optional),
       | *segmentation3d_as_ply* (optional),
       | *objects3d* (optional),
       | *objects3d_as_dgn* (optional),
       | *objects3d_as_3d_tiles* (optional),
       | *objects3d_as_geojson* (optional),
       | *locations3d_as_shp* (optional),
       | *locations3d_as_geojson* (optional),
       | *lines3d* (optional),
       | *lines3d_as_dgn* (optional),
       | *lines3d_as_3d_tiles* (optional),
       | *lines3d_as_geojson* (optional),
       | *polygons3d* (optional),
       | *polygons3d_as_dgn* (optional),
       | *polygons3d_as_3d_tiles* (optional),
       | *polygons3d_as_geojson* (optional)
     - | *remove_small_components*,
       | *compute_line_width*,
       | *save_confidence*,
       | *srs*
   * - | Given a 3D segmentation,
       | infer 3D objects, 3D
       | lines and 3D polygons
     - | *segmentation3d*,
       | *clip_polygon* (optional)
     - | *objects3d* (optional),
       | *objects3d_as_dgn* (optional),
       | *objects3d_as_3d_tiles* (optional),
       | *objects3d_as_geojson* (optional),
       | *locations3d_as_shp* (optional),
       | *locations3d_as_geojson* (optional),
       | *lines3d* (optional),
       | *lines3d_as_dgn* (optional),
       | *lines3d_as_3d_tiles* (optional),
       | *lines3d_as_geojson* (optional),
       | *polygons3d* (optional),
       | *polygons3d_as_dgn* (optional),
       | *polygons3d_as_3d_tiles* (optional),
       | *polygons3d_as_geojson* (optional)
     - | *remove_small_components*,
       | *compute_line_width*,
       | *save_confidence*,
       | *srs*

Examples
========

In this example, we will create a specification for submitting a Segmentation 3D job to segment meshes.

.. literalinclude:: examples/s3d_specs_segment_meshes.py
  :language: Python

In this example, we will create a specification for submitting a Segmentation 3D job to segment point clouds.

.. literalinclude:: examples/s3d_specs_segment_pc.py
  :language: Python

In this example, we will create a specification for submitting a Segmentation 3D job to segment point clouds and infer 3D lines.

.. literalinclude:: examples/s3d_specs_segment_pc_and_infer_3d_lines.py
  :language: Python

In this example, we will create a specification for submitting a Segmentation 3D job to infer 3D lines given a 3D segmentation.

.. literalinclude:: examples/s3d_specs_infer_3d_lines_given_3d_segmentation.py
  :language: Python


Classes
=======

.. currentmodule:: reality_capture.specifications.segmentation3d

.. autopydantic_model:: Segmentation3DSpecificationsCreate

.. autoclass:: Segmentation3DOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: Segmentation3DSpecifications

.. autopydantic_model:: Segmentation3DInputs
    :model-show-json: False

.. autopydantic_model:: Segmentation3DOutputs
    :model-show-json: False

.. autopydantic_model:: Segmentation3DOptions
    :model-show-json: False