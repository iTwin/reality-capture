=============
Data Handlers
=============

Data Handlers are classes handling the uploads and downloads of your files.
Two classes are available: one for Reality Data, one for Bucket.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========
In this example, we will upload a file to a Reality Data, then list the data inside it, and finally download everything to a local destination.

.. literalinclude:: examples/handle_data.py
  :language: Python

In this example, we will upload a file to a bucket, then list the data inside it, and finally download everything to a local destination.

.. literalinclude:: examples/handle_bucket.py
  :language: Python

Classes
=======

.. currentmodule:: reality_capture.service.data_handler

.. autoclass:: RealityDataHandler
    :members:
    :undoc-members:

.. autoclass:: BucketDataHandler
    :members:
    :undoc-members:
