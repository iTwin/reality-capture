===================
Vector optimization
===================

The *vector optimization* job takes one or multiple reality data vectors as an input and will consolidate them into a vector data.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we create a specification for submitting a vector optimization job to the Bentley Feature Database:

.. literalinclude:: examples/vector_optim.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.vector_optimization

.. autopydantic_model:: VectorOptimizationSpecificationsCreate

.. autopydantic_model:: VectorOptimizationSpecifications

.. autopydantic_model:: VectorOptimizationInputs
    :model-show-json: False

.. autopydantic_model:: VectorOptimizationOptions
    :model-show-json: False

.. autoclass:: VectorOptimizationFormat
    :show-inheritance:
    :members:
    :undoc-members:
