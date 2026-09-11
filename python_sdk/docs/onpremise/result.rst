======
Result
======

The ``Result`` object is the class handling all the responses from the managers.
It either contains an error object if the call to the service resulted in an error or the object returned by the service.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

In this example, we make a simple call to the Engine Manager and handle the error case:

.. literalinclude:: examples/result.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.on_premise.result

.. autoclass:: Result
    :show-inheritance:
    :members:
    :exclude-members: __new__

.. autoclass:: ManagerErrorCode
    :show-inheritance:
    :members:
    :undoc-members: