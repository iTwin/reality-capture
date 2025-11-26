=====================
Fill Image Properties
=====================

.. image:: fip_header.png

The *Fill Image Properties* job allows you to transform a list of images into a scene with known metadata, such as GPS information.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we create a specification for submitting a Fill Image Properties job with two image collections as inputs, a Scene output and we specify the altitude reference in the options.

.. literalinclude:: examples/fill_image_properties_specs.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.specifications.fill_image_properties

.. autopydantic_model:: FillImagePropertiesSpecificationsCreate

.. autoclass:: FillImagePropertiesOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: FillImagePropertiesSpecifications

.. autopydantic_model:: FillImagePropertiesInputs
    :model-show-json: False

.. autopydantic_model:: FillImagePropertiesOutputs
    :model-show-json: False

.. autopydantic_model:: FillImagePropertiesOptions
    :model-show-json: False

.. autoclass:: AltitudeReference
    :show-inheritance:
    :members:
    :undoc-members:
