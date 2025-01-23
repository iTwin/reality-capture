=======================
Segmentation Orthophoto
=======================

The Segmentation Orthophoto job uses an orthophoto segmentation detector to classify pixels in orthophotos. It produces segmented orthophotos and a context pointing to these orthophotos. Depending on the detector, it can detect 2D lines and 2D polygons. Optionally, these 2D lines and 2D polygons can be exported as SHP, DGN or GeoJSON files.

.. contents:: Quick access
   :local:
   :depth: 2

Purposes
========

.. list-table::
   :widths: 25 25 25 25
   :header-rows: 1

   * - Purpose
     - Inputs
     - Possible outputs
     - Useful options
   * - Segmentation of orthophoto
     - | *orthophoto*,
       | *orthophoto_segmentation_detector*
     - | *segmentation2d*,
       | *segmented_photos*,
       | *polygons2d* (optional),
       | *polygons2d_as_shp* (optional),
       | *polygons2d_as_geojson* (optional),
       | *lines2d* (optional),
       | *lines2d_as_dgn* (optional),
       | *lines2d_as_shp* (optional),
       | *lines2d_as_geojson* (optional)
     - |

Examples
========

In this example, we will create a specification for submitting a Segmentation Orthophoto job to classify pixels in orthophotos.

.. literalinclude:: examples/sortho_specs_classify_pixels.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.segmentation_orthophoto

.. autopydantic_model:: SegmentationOrthophotoSpecificationsCreate

.. autoclass:: SegmentationOrthophotoOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: SegmentationOrthophotoSpecifications

.. autopydantic_model:: SegmentationOrthophotoInputs
    :model-show-json: False

.. autopydantic_model:: SegmentationOrthophotoOutputs
    :model-show-json: False

.. autopydantic_model:: SegmentationOrthophotoOptions
    :model-show-json: False