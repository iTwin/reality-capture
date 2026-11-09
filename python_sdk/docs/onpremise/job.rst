===
Job
===

The Job class represents a job in the OnPremise iTwin Capture job queue.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we create a Job Manager on a new job queue.

.. literalinclude:: examples/job_manager.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.on_premise.job

.. autopydantic_model:: Job
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: Progress
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: Execution
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: Milestone
    :inherited-members: BaseModel
    :model-show-json: False

.. autoclass:: JobPriority
    :show-inheritance:
    :members:
    :undoc-members: