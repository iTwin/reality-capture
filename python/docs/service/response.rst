========
Response
========

The ``Response`` object is the class handling all the responses from the service.
It either contains an error object if the call to the service resulted in an error or the object returned by the service.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we make a simple call to the service and handle the error case:

.. literalinclude:: examples/error.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.service.response

.. autoclass:: Response
    :show-inheritance:
    :members:
    :exclude-members: __new__
