===
Job
===

This section describes extensively the Job object.
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

.. autopydantic_model:: Execution
    :model-show-json: False

.. autopydantic_model:: Job
    :model-show-json: False

.. autopydantic_model:: JobResponse

.. autopydantic_model:: Progress
    :model-show-json: False

.. autopydantic_model:: ProgressResponse

.. autopydantic_model:: Message
    :model-show-json: False

.. autopydantic_model:: Messages
    :model-show-json: False

.. autopydantic_model:: MessagesResponse
