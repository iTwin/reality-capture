==================
Import Point Cloud
==================

.. image:: ipc_header.png

The *Import Point Cloud* job allows you to transform a regular point cloud (E57, LAS, ...) into a ScanCollection that can be leveraged by other jobs (such as Calibration, Tiling or Production).

.. attention::

   Even POD files have to be imported through this job. The import process will add specific metadata that are necessary for subsequent jobs to work.

Supported file formats are

* ``E57``, ``PTX``, ``LAS``, ``LAZ``, ``POD`` for static point clouds
* ``E57``, ``LAS``, ``LAZ`` for mobile point clouds

.. contents:: Quick access
   :local:
   :depth: 2


Examples
========

In this example, we create a specification for submitting a Import Point Cloud job. It will create a scan collection and a ContextScene pointing to that scan collection.

.. literalinclude:: examples/import_pc_specs.py
  :language: Python


ScanCollection
==============

A ScanCollection is made of 3 files:

* ``pc.pod``, the point cloud data.
* ``pc.json``, metadata file containing information about the point cloud. See :class:`reality_capture.specifications.import_point_cloud.PodMetadata` for the schema.
* ``pc.complete``, indicates the import is complete.

ContextScenes
=============

The ``scene`` input must point to a ContextScene describing the point cloud and its metadata. There are multiple ways to describe this.

Static point cloud with known location in file
----------------------------------------------

.. literalinclude:: cs_pc_location_in_file.json
  :language: JSON

In this ContextScene, we have one E57 point cloud of type ``Static`` and with the location inside the file (``InFile``).
Typically, all ``PTX`` files should be imported like this and most ``E57`` files also.

Static point cloud with known location in scene
-----------------------------------------------

.. literalinclude:: cs_pc_location_in_scene.json
  :language: JSON

In this ContextScene, we have one LAS point cloud of type ``Static`` and with the location inside the scene (``Center``).

Static point cloud with unknown location
----------------------------------------

.. literalinclude:: cs_pc_unknown_location.json
  :language: JSON

In this ContextScene, we have one LAS point cloud of type ``Static`` and with the location unknown (``Unknown``).
In that case, the Import Point Cloud job will try to detect the scanner location. If it fails to do so, the import will fail.

Mobile point cloud with trajectories
------------------------------------

.. literalinclude:: cs_pc_mobile.json
  :language: JSON

In this ContextScene, we have one LAS point cloud of type ``Mobile``, and with a ``TrajectoryId``. The trajectory information is provided as to correctly parse the trajectory files.

Classes
=======

.. currentmodule:: reality_capture.specifications.import_point_cloud

.. autopydantic_model:: ImportPCSpecificationsCreate

.. autoclass:: ImportPCOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: ImportPCSpecifications

.. autopydantic_model:: ImportPCInputs
    :model-show-json: False

.. autopydantic_model:: ImportPCOutputs
    :model-show-json: False

.. autopydantic_model:: Point3dTime
    :model-show-json: False
    :inherited-members: BaseModel

.. autopydantic_model:: Scan
    :model-show-json: False

.. autopydantic_model:: PodMetadata
