===
Job
===

This section describes extensively the Job object and associated objects.
The Job object and its associated objects are the main payload information concerning jobs.

Classes
=======

.. currentmodule:: reality_capture.service.job

.. autoclass:: JobType
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: JobState
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: Service
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: JobCreate
    :inherited-members: BaseModel

.. autopydantic_model:: Execution
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: Job
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: JobResponse
    :inherited-members: BaseModel

.. autopydantic_model:: Progress
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: ProgressResponse
    :inherited-members: BaseModel

.. autopydantic_model:: Message
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: Messages
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: MessagesResponse
    :inherited-members: BaseModel

.. autopydantic_model:: NextPageLink
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: Jobs
    :inherited-members: BaseModel
