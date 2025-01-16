===========
Calibration
===========

The *Calibration* job allows to calibrate and register in 3D photos and point clouds. It will also generate tie points between photos.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we create a specification for submitting a calibration job with default options:

.. literalinclude:: calib_specs_default.py
  :language: Python

In this example, we create a specification for submitting a calibration job where positions and rotation are adjusted:

.. literalinclude:: calib_specs_adjust.py
  :language: Python


Classes
=======

.. currentmodule:: reality_capture.specifications.calibration

.. autopydantic_model:: CalibrationSpecificationsCreate

.. autoclass:: CalibrationOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: CalibrationSpecifications

.. autopydantic_model:: CalibrationInputs
    :model-show-json: False

.. autopydantic_model:: CalibrationOutputs
    :model-show-json: False

.. autopydantic_model:: CalibrationOptions
    :model-show-json: False

.. autoclass:: RigSynchro
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: RotationPolicy
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: CenterPolicy
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: FocalPolicy
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: PrincipalPolicy
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: RadialPolicy
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: TangentialPolicy
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: FisheyeFocalPolicy
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: FisheyeDistortionPolicy
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: AspectRatioPolicy
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: SkewPolicy
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: TiepointsPolicy
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: PairSelection
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: KeypointsDensity
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: Tag
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: ColorEqualization
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: AdjustmentConstraints
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: RigidRegistrationPosition
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: RigidRegistrationRotation
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: RigidRegistrationScale
    :show-inheritance:
    :members:
    :undoc-members:

