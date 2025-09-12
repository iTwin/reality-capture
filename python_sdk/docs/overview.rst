========
Overview
========

This package helps you interacts with the Bentley Reality Capture APIs. Here we will describe quickly each of them

.. contents:: Quick access
   :local:
   :depth: 2

Reality Management
==================

The Reality Management API is your gateway to storing and interacting with Reality Data - meshes, point clouds, images, etc.
This is particularly needed for Modeling jobs, as almost all the inputs need to be stored in Reality Data, and almost all the outputs are stored in Reality Data.
The Reality Management API also provides the ability to retrieve information about the reality data that is associated with an infrastructure iTwin.

The models of the APIs are documented in the :doc:`service/reality_data` section, methods for interacting with them are described in :doc:`service/service` and upload/download functions are available with our :doc:`service/data_handler`.

Reality Modeling
================

The Reality Modeling API provides multiple jobs to turn images and point clouds into meshes, point clouds, orthophoto and DSM.
The API is data centric: it takes data as an input, and will produce data as an output, that can then be used as an input in a subsequent job.

Typical workflows
-----------------

In this section, we will quickly review the typical workflows for Modeling API.

Photos to Mesh
^^^^^^^^^^^^^^

Starting from images uploaded in Reality Management in an Image Collection, you will need to chain these jobs to obtain a 3D model:

 - :doc:`specifications/fill_image_properties` using your Image Collection as input in order to create a *Context Scene*;
 - :doc:`specifications/calibration` using the previous *Context Scene* in order to calibrate and position all the images in space in another *Context Scene*;
 - :doc:`specifications/tiling` using the previous *Context Scene* in order to create a *Modeling Reference* - more on that in the next section;
 - :doc:`specifications/production` using the *Context Scene* from Tiling and the previous *Modeling Reference* to obtain a 3D mesh, 3D point cloud or OrthoDSM;

Photos to Gaussian Splats
^^^^^^^^^^^^^^^^^^^^^^^^^

If you wish to generate Gaussian Splats, in a similar fashion, you will need to chain these jobs to obtain a 3D model:

 - :doc:`specifications/fill_image_properties` using your Image Collection as input in order to create a *Context Scene*;
 - :doc:`specifications/calibration` using the previous *Context Scene* in order to calibrate and position all the images in space in another *Context Scene*;
 - :doc:`specifications/gaussian_splats` using the previous *Context Scene* in order to compute the Gaussian Splats;

Modeling Reference
------------------

The *Modeling Reference* is a specific dataset: it holds geometric cache from your data.
This is used so that, if you need another export of your model (a different format, a different configuration), the job processing will be faster.
In that respect, while it is most of the time an input, the *Modeling Reference* will be updated through jobs.
It is **strongly** advised not to modify the *Modeling Reference* manually, as it could break it.
See :ref:`Modeling Reference <modeling-reference>` for more details.

Bucket
======

In multiple APIs, you will encounter the *Bucket*.
The *Bucket* is a storage space shared between the APIs in order to host data that are not Reality Data.
For example, a KML defining a region of interest, an JSON report or an OBJ constraint would be stored in a bucket.
A bucket is *iTwin* dependent, that is each *iTwin* has a single bucket.