======================
Point Cloud Conversion
======================

The *Point Cloud Conversion* job allows you to convert point clouds from one format to another.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========
In this example, we will convert a point cloud to the 3D Tiles point cloud format.

.. literalinclude:: examples/convert_pc_specs.py
  :language: Python

Conversion table
================

This table below lists all the formats accepted either as input or output.

+--------------------------------------+-----------+-------------------+-------+--------+
| Format                               | Extension | Reality Data Type | Input | Output |
+======================================+===========+===================+=======+========+
| ASTM E57                             | .e57      | E57               | ✅    |        |
+--------------------------------------+-----------+-------------------+-------+--------+
| Laser Exchange Format                | .las      | LAS               | ✅    |        |
+--------------------------------------+-----------+-------------------+-------+--------+
| LAS zip Exchange Format              | .laz      | LAZ               | ✅    |        |
+--------------------------------------+-----------+-------------------+-------+--------+
| Polygon File Format                  | .ply      | PLY               | ✅    |        |
+--------------------------------------+-----------+-------------------+-------+--------+
| Pointools POD                        | .pod      | PointCloud        | ✅    |        |
+--------------------------------------+-----------+-------------------+-------+--------+
| Orbit Point Cloud                    | .opc      | OPC               | ✅    | ✅     |
+--------------------------------------+-----------+-------------------+-------+--------+
| OGC 3DTiles Point Cloud              | .json     | PNTS              |       | ✅     |
+--------------------------------------+-----------+-------------------+-------+--------+
| Graphics Language Binary             | .glb      | GLB               |       | ✅     |
+--------------------------------------+-----------+-------------------+-------+--------+
| Compressed Graphics Language Library | .glb      | GLB               |       | ✅     |
+--------------------------------------+-----------+-------------------+-------+--------+

Classes
=======

.. currentmodule:: reality_capture.specifications.point_cloud_conversion

.. autopydantic_model:: PointCloudConversionSpecificationsCreate

.. autoclass:: PCConversionOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: PointCloudConversionSpecifications

.. autopydantic_model:: PCConversionInputs
    :model-show-json: False

.. autopydantic_model:: PCConversionOutputs
    :model-show-json: False

.. autopydantic_model:: PCConversionOptions
    :model-show-json: False
