=======================
Reality Capture Service
=======================

Reality Capture Service is the class handling the communication with the Reality Capture APIs.

.. contents:: Quick access
   :local:
   :depth: 2

Examples
========

This section showcases multiple examples for interacting with jobs and reality data.

Interact with jobs
------------------

In this example, we will create and submit a job.
If submission is successful, we will obtain a ``Job`` object as a response:

.. literalinclude:: examples/submit_job.py
  :language: Python

Once submitted, we can follow the job progress like this:

.. literalinclude:: examples/get_job_progress.py
  :language: Python

And if needed, the job can be cancelled:

.. literalinclude:: examples/cancel_job.py
  :language: Python

Interact with reality data
--------------------------

In this example, we will create a new reality data:

.. literalinclude:: examples/create_reality_data.py
  :language: Python

Then, we can update its properties:

.. literalinclude:: examples/update_reality_data.py
  :language: Python

And then you can get ``write`` access in order to upload data inside it:

.. literalinclude:: examples/get_reality_data_write_access.py
  :language: Python


Classes
=======

.. currentmodule:: reality_capture.service.service

.. autoclass:: RealityCaptureService
    :members:
    :undoc-members:
