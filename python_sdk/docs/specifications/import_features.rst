==============
ImportFeatures
==============

The *ImportFeatures* jobs allows you to imports vector data stored into Feature Class

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we will create a specification for submitting a conversion job to import a geojson in a feature class.

.. literalinclude:: examples/import_features_specs.py
  :language: Python


Classes
=======

.. currentmodule:: reality_capture.specifications.import_features

.. autopydantic_model:: ImportFeaturesSpecificationsCreate

.. autoclass:: ImportFeaturesOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: ImportFeaturesSpecifications

.. autopydantic_model:: ImportFeaturesInputs
    :model-show-json: False

.. autopydantic_model:: ImportFeaturesOutputs
    :model-show-json: False

.. autopydantic_model:: ImportFeaturesOptions
    :model-show-json: False