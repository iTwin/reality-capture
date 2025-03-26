===============
Cost Estimation
===============

This section describes extensively the Cost Estimation classes.
These are useful when you wish to know the estimated cost of a job prior to submitting it.

Classes
=======

.. currentmodule:: reality_capture.service.estimation

.. autoclass:: UnitType
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: CostEstimationCreate

.. autopydantic_model:: CostEstimation

.. currentmodule:: reality_capture.specifications.calibration

.. autopydantic_model:: CalibrationCost
    :model-show-json: False

.. currentmodule:: reality_capture.specifications.constraints

.. autopydantic_model:: ConstraintsCost
    :model-show-json: False

.. currentmodule:: reality_capture.specifications.fill_image_properties

.. autopydantic_model:: FillImagePropertiesCost
    :model-show-json: False

.. currentmodule:: reality_capture.specifications.import_point_cloud

.. autopydantic_model:: ImportPCCost
    :model-show-json: False

.. currentmodule:: reality_capture.specifications.production

.. autopydantic_model:: ProductionCost
    :model-show-json: False

.. currentmodule:: reality_capture.specifications.reconstruction

.. autopydantic_model:: ReconstructionCost
    :model-show-json: False

.. currentmodule:: reality_capture.specifications.tiling

.. autopydantic_model:: TilingCost
    :model-show-json: False

.. currentmodule:: reality_capture.specifications.touchup

.. autopydantic_model:: TouchUpExportCost
    :model-show-json: False

.. autopydantic_model:: TouchUpImportCost
    :model-show-json: False

.. currentmodule:: reality_capture.specifications.water_constraints

.. autopydantic_model:: WaterConstraintsCost
    :model-show-json: False
