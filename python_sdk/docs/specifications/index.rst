==============
Specifications
==============

Specifications regroup all the settings used to create jobs with our APIs.

.. contents:: Quick access
   :local:
   :depth: 2

.. toctree::
    :titlesonly:
    :hidden:

    fill_image_properties
    import_pc
    calibration
    tiling
    production
    reconstruction
    constraints
    touchup
    water_constraints
    gaussian_splats
    geometry
..
    point_cloud_conversion
    objects2d
    segmentation2d
    segmentation_orthophoto
    segmentation3d
    change_detection
    eval_o2d
    eval_o3d
    eval_s2d
    eval_s3d
    eval_sortho
    training_o2d
    training_s3d

Modeling
========

* :doc:`/specifications/fill_image_properties` will turn a list of images into a ContextScene with the appropriate metadata.
* :doc:`/specifications/import_pc` will turn a regular point cloud (E57/LAS/…) into a POD with metadata information that can be used in further jobs.
* :doc:`/specifications/calibration` will take a scene made of images and/or point clouds and calibrate them together. Its inputs are usually the outputs of **Fill Image Properties** and **Import Point Cloud**.
* :doc:`/specifications/tiling` will take a scene with tie points and create a tiling and a modeling reference. Its inputs are usually the outputs of **Calibration**.
* :doc:`/specifications/production` will take a scene with tie points and a modeling reference and create a 3D export (e.g. 3D Tiles). Its inputs are usually the outputs of **Tiling**.
* :doc:`/specifications/reconstruction` is a job that combines **Tiling** and **Production** into a single job.
* :doc:`/specifications/constraints` will import or delete surface constraints from a Reference Model.
* :doc:`/specifications/touchup` has two jobs that will allow you to export tiles in a editable format for touch up workflows and reimport your modifications.
* :doc:`/specifications/water_constraints` will take a scene and a Reference Model and will try to detect water constraints.
* :doc:`/specifications/gaussian_splats` will take a scene and generate Gaussian Splats in various formats.

.. Analysis
.. ========

.. * :doc:`/specifications/objects2d` uses a photo detector to detect 2D objects in photos. If the photos are oriented, it can turn these 2D objects into 3D features.
.. * :doc:`/specifications/segmentation2d` uses a photo segmentation detector to classify pixels in photos. If photos are oriented, it can project this classification onto reality data like meshes to create 3D features.
.. * :doc:`/specifications/segmentation_orthophoto` uses an orthophoto segmentation detector to classify pixels in an orthophoto and create 2D features.
.. * :doc:`/specifications/segmentation3d` uses a point cloud segmentation detector to classify each point of a point cloud and create 3D features.
.. * :doc:`/specifications/change_detection` will take two point clouds or two meshes to to get 3D regions that capture the changes.
.. * :doc:`/specifications/training_o2d` will train an o2d detector from a ContextScene
.. * :doc:`/specifications/training_s3d` will train an s3d detector from a ContextScene
.. * :doc:`/specifications/eval_o2d`, :doc:`/specifications/eval_o3d`, :doc:`/specifications/eval_s2d`, :doc:`/specifications/eval_s3d` and :doc:`/specifications/eval_sortho` will compare a prediction to a reference for a specific detection.

.. Conversion
.. ==========

.. * :doc:`/specifications/point_cloud_conversion` will convert point clouds from one format to another.

Utilities
=========

* :doc:`/specifications/geometry` regroups information about geometric structures used within different jobs.
