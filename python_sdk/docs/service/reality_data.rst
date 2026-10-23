============
Reality Data
============

This section describes extensively the Reality Data information and all the necessary structures for interacting with a Reality Data.

Classes
=======

.. currentmodule:: reality_capture.service.reality_data

.. autoclass:: Classification
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: Type
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: Acquisition
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: Coordinate
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: Extent
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: RealityData
    :model-show-json: False
    :inherited-members: BaseModel

.. autopydantic_model:: RealityDataCreate
    :model-show-json: False
    :inherited-members: BaseModel

.. autopydantic_model:: RealityDataUpdate
    :model-show-json: False
    :inherited-members: BaseModel

.. autoclass:: ContainerType
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: Access
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: URL
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: ContainerLinks
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: ContainerDetails
    :inherited-members: BaseModel
    :model-show-json: False

.. autoclass:: Prefer
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: RealityDataFilter
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: RealityDataMinimal
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: NextPageLink
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: RealityDatas
    :inherited-members: BaseModel
    :model-show-json: False
