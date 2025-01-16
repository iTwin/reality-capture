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

.. code-block:: python

  import reality_capture.specifications.fill_image_properties as fip

  fips = fip.FillImagePropertiesSpecificationsCreate()
  fips.inputs.image_collections = ["fad5be03-30ee-4801-90e0-dee0349e5bce", "e1cbd494-8e62-4004-89f9-8776aea1af50"]
  fips.outputs = [fip.FillImagePropertiesOutputsCreate.SCENE]
  fips.options.altitude_reference = fip.AltitudeReference.SEA_LEVEL

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
