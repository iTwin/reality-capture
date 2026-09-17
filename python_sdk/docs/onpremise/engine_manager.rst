==============
Engine Manager
==============

The Engine Manager provides a class to manage engines in a Job Queue.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we create an Engine Manager on a new job queue.

.. literalinclude:: examples/engine_manager.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.on_premise.engine_manager

.. autoclass:: EngineManager
    :show-inheritance:
    :members:
    :exclude-members: __new__

.. autopydantic_model:: EngineDetails
    :inherited-members: BaseModel
    :model-show-json: False

.. autoclass:: EngineSignal
    :show-inheritance:
    :members:
    :undoc-members:

.. autoclass:: EngineStatus
    :show-inheritance:
    :members:
    :undoc-members: