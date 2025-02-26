==========
Conversion
==========

The *Conversion* jobs allows you to convert point clouds formats to web-friendly OPC and PNTS format.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we will create a specification for submitting a conversion job that converts a las file in opc format.

.. literalinclude:: examples/conversion_specs.py
  :language: Python


Classes
=======

.. currentmodule:: reality_capture.specifications.conversion

.. autopydantic_model:: ConversionSpecificationsCreate

.. autoclass:: ConversionOutputsCreate
    :show-inheritance:
    :members:
    :undoc-members:

.. autopydantic_model:: ConversionSpecifications

.. autopydantic_model:: ConversionInputs
    :model-show-json: False

.. autopydantic_model:: ConversionOutputs
    :model-show-json: False

.. autopydantic_model:: ConversionOptions
    :model-show-json: False
