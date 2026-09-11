===========
Job Manager
===========

The Job Manager provides a class to create and manage jobs in the OnPremise iTwin Capture job queue.

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

.. currentmodule:: reality_capture.on_premise.job_manager

.. autoclass:: JobManager
    :show-inheritance:
    :members:
    :exclude-members: __new__

.. autopydantic_model:: JobPage
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: QueueSummary
    :inherited-members: BaseModel
    :model-show-json: False

.. autopydantic_model:: ActiveJob
    :inherited-members: BaseModel
    :model-show-json: False