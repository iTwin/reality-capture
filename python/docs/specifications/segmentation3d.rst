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

.. list-table:: Purposes
   :widths: 25 25 25 25
   :header-rows: 1

   * - Purpose
     - Inputs
     - Possible outputs
     - Useful options
   * - Segment a collection of point clouds
     - | *pointClouds*,
       | *pointCloudSegmentationDetector*,
       | *clipPolygon* (optional)
     - | *segmentation3D*,
       | *segmentedPointCloud*,
       | *exportedSegmentation3DLAS* (optional),
       | *exportedSegmentation3DLAZ* (optional),
       | *exportedSegmentation3DPOD* (optional),
       | *exportedSegmentation3DPLY* (optional)
     - | *saveConfidence*,
       | *exportSrs*
   * - | Segment a collection of meshes
     - | *meshes*,
       | *pointCloudSegmentationDetector*,
       | *clipPolygon* (optional)
     - | *segmentation3D*,
       | *segmentedPointCloud*,
       | *exportedSegmentation3DLAS* (optional),
       | *exportedSegmentation3DLAZ* (optional),
       | *exportedSegmentation3DPOD* (optional),
       | *exportedSegmentation3DPLY* (optional)
     - | *saveConfidence*,
       | *exportSrs*
   * - | Segment a collection of point clouds or meshes
       | and infer 3D objects, 3D lines and 3D polygons
     - | *pointClouds/meshes*,
       | *pointCloudSegmentationDetector*,
       | *clipPolygon* (optional)
     - | *segmentation3D*,
       | *segmentedPointCloud*,
       | *exportedSegmentation3DLAS* (optional),
       | *exportedSegmentation3DLAZ* (optional),
       | *exportedSegmentation3DPOD* (optional),
       | *exportedSegmentation3DPLY* (optional),
       | *objects3D* (optional),
       | *exportedObjects3DDGN* (optional),
       | *exportedObjects3DCesium* (optional),
       | *exportedObjects3DGeoJSON* (optional),
       | *exportedLocations3DSHP* (optional),
       | *exportedLocations3DGeoJSON* (optional),
       | *lines3D* (optional),
       | *exportedLines3DDGN* (optional),
       | *exportedLines3DCesium* (optional),
       | *exportedLines3DGeoJSON* (optional),
       | *polygons3D* (optional),
       | *exportedPolygons3DDGN* (optional),
       | *exportedPolygons3DCesium* (optional),
       | *exportedPolygons3DGeoJSON* (optional)
     - | *removeSmallComponents*,
       | *computeLineWidth*,
       | *saveConfidence*,
       | *exportSrs*
   * - | Given a 3D segmentation, infer 3D objects, 3D lines and 3D polygons
     - | *segmentation3D*,
       | *clipPolygon* (optional)
     - | *objects3D* (optional),
       | *exportedObjects3DDGN* (optional),
       | *exportedObjects3DCesium* (optional),
       | *exportedObjects3DGeoJSON* (optional),
       | *exportedLocations3DSHP* (optional),
       | *exportedLocations3DGeoJSON* (optional),
       | *lines3D* (optional),
       | *exportedLines3DDGN* (optional),
       | *exportedLines3DCesium* (optional),
       | *exportedLines3DGeoJSON* (optional),
       | *polygons3D* (optional),
       | *exportedPolygons3DDGN* (optional),
       | *exportedPolygons3DCesium* (optional),
       | *exportedPolygons3DGeoJSON* (optional)
     - | *removeSmallComponents*,
       | *computeLineWidth*,
       | *saveConfidence*,
       | *exportSrs*

Examples
========

In this example, we will create a specification for submitting a Segmentation 3D job to segment meshes.

.. literalinclude:: s3d_specs_segment_meshes.py
  :language: Python

In this example, we will create a specification for submitting a Segmentation 3D job to segment point clouds.

.. literalinclude:: s3d_specs_segment_pc.py
  :language: Python

In this example, we will create a specification for submitting a Segmentation 3D job to segment point clouds and infer 3D lines.

.. literalinclude:: s3d_specs_segment_pc_and_infer_3d_lines.py
  :language: Python

In this example, we will create a specification for submitting a Segmentation 3D job to infer 3D lines given a 3D segmentation.

.. literalinclude:: s3d_specs_infer_3d_lines_given_3d_segmentation.py
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