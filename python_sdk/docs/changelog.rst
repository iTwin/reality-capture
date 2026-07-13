=========
Changelog
=========

This page documents all notable changes to the ``reality_capture`` Python SDK across each release.

.. contents:: Versions
   :local:
   :depth: 1

----

2.6.0
=============

Additions
---------

- Analysis jobs (Objects 2D/3D, Segmentation 2D/3D/Orthophoto, Change Detection, Eval O2D/O3D/S2D/S3D/SOrtho,
  and Training S3D) are now **Generally Available**.
  (`#306 <https://github.com/iTwin/reality-capture/pull/306>`_)
- Added a new **Training S3D** job type (:class:`~reality_capture.specifications.training.TrainingS3DSpecificationsCreate`,
  :class:`~reality_capture.specifications.training.TrainingS3DSpecifications`) that trains a new
  point cloud segmentation (S3D) detector from a set of annotated 3D segmentations, with configurable
  ``epochs``, ``spacing``, ``model`` architecture, ``features``, and ``versionNumber`` options.
  (`#306 <https://github.com/iTwin/reality-capture/pull/306>`_)
- Reworked the **Change Detection** job: inputs/outputs now support Gaussian Splats models and an optional
  ``preset``; outputs report per-model segmentations (``segmentation3DA``/``segmentedModel3DA``,
  ``segmentation3DB``/``segmentedModel3DB``) and per-model change locations
  (``locations3DA``/``locations3DAAsSHP``/``locations3DAAsGeoJSON`` and their ``B`` counterparts) instead of the
  previous single-sided ``objects3D``/``changesInModelA``/``changesInModelB`` outputs; options were renamed to
  ``samplingResolution`` and ``growThreshold``/``filterThreshold``.
  (`#306 <https://github.com/iTwin/reality-capture/pull/306>`_)
- **Segmentation 3D** and **Eval S3D** outputs now expose a single ``segmentedModel3D`` field (matching the
  input model's format) instead of the previous OPC/POD/LAS/LAZ/PLY-specific outputs, and the ``crs`` and
  ``keepInputResolution`` options were removed from ``Segmentation3DOptions``.
  (`#306 <https://github.com/iTwin/reality-capture/pull/306>`_)
- Added a ``DetectorType`` enum re-export point and new detector helper docstrings clarifying
  ``create_detector``, ``delete_detector``, ``publish_detector_version``, and ``unpublish_detector_version``
  behavior.
  (`#306 <https://github.com/iTwin/reality-capture/pull/306>`_)
- ``set_progress_hook()`` on ``RealityDataHandler`` and ``BucketDataHandler`` now has a precise
  ``Callable[[float], bool]`` type hint for the ``hook`` parameter.
  (`#306 <https://github.com/iTwin/reality-capture/pull/306>`_)

Fixes
-----

- **Breaking change:** Removed the **Clearance** job type (``ClearanceSpecificationsCreate``,
  ``ClearanceSpecifications``, ``JobType.CLEARANCE_CALCULATION``) (were in tech preview)
  (`#306 <https://github.com/iTwin/reality-capture/pull/306>`_)
- **Breaking change:** ``Response`` is now a plain dataclass instead of a ``tuple`` subclass; code that
  relied on unpacking a ``Response`` as a tuple must access ``.status_code``, ``.error``, and ``.value``
  directly instead.
  (`#306 <https://github.com/iTwin/reality-capture/pull/306>`_)

----

2.5.0
=====

Additions
---------

- Added ``I3S`` and ``OSGB`` as new Modeling production export formats
  (:attr:`~reality_capture.specifications.production.Format.I3S`,
  :attr:`~reality_capture.specifications.production.Format.OSGB`),
  with corresponding option models ``OptionsI3S`` and ``OptionsOSGB``.
  (`#293 <https://github.com/iTwin/reality-capture/pull/293>`_)
- Added ``JPEG`` as a new ortho export format
  (:attr:`~reality_capture.specifications.production.OrthoFormat.JPEG`) and the
  ``OverviewType`` enum; the ``overviews`` field is now available on ``OptionsOrthoDSM``.
  (`#293 <https://github.com/iTwin/reality-capture/pull/293>`_)
- Added optional ``preset`` input field to Gaussian Splats job specifications.
  (`#293 <https://github.com/iTwin/reality-capture/pull/293>`_)
- Added new reality data types to :class:`~reality_capture.service.reality_data.Type`:
  ``ORTHOPHOTO``, ``GS_PLY``, ``GS_SPZ``, ``GS_3DT``, ``GEO_JSON``, ``SHP``.
  (`#293 <https://github.com/iTwin/reality-capture/pull/293>`_)
- Added optional ``detectors_filter`` parameter to ``get_detectors()`` for server-side
  filtering by labels and exports.
  (`#285 <https://github.com/iTwin/reality-capture/pull/285>`_)
- Added ``create_detector``, ``update_detector``, ``delete_detector``, ``create_detector_version``, 
  ``delete_detector_version``, ``publish_detector_version``, ``unpublish_detector_version`` and 
  ``complete_detector_version_upload`` methods to manage Detectors through the service.
  (`#296 <https://github.com/iTwin/reality-capture/pull/296>`_)

Fixes
-----

- Fixed ``RealityDataFilter`` query serialization: the ``itwin_id`` (``iTwinId``), ``search``
  (``$search``), ``extent``, and ``types`` fields are now correctly encoded as API query parameters.
  (`#285 <https://github.com/iTwin/reality-capture/pull/285>`_)
- Fixed ``move_reality_data()`` so the iTwin ID is sent correctly in the JSON request body.
  (`#285 <https://github.com/iTwin/reality-capture/pull/285>`_)
- **Breaking change:** The ``filters`` parameter of ``get_jobs()`` is now required; the API
  always requires at least one filter criterion.
  (`#285 <https://github.com/iTwin/reality-capture/pull/285>`_)

----

2.4.2
=====

Additions
---------

- Network-level failures (e.g. connection refused, DNS errors) are now returned as a structured
  :class:`~reality_capture.service.response.Response` with error code ``NetworkError`` and status ``503``,
  instead of raising an unhandled exception.
  (`#284 <https://github.com/iTwin/reality-capture/pull/284>`_)

Fixes
-----

- Fixed SSL certificate verification so that requests succeed on all platforms without manual configuration.
  (`#284 <https://github.com/iTwin/reality-capture/pull/284>`_)
- Fixed service methods crashing when a server returns a non-JSON error body.
  (`#284 <https://github.com/iTwin/reality-capture/pull/284>`_)
- Improved error handling across all service methods: invalid requests and unsupported job types now return a
  structured error response instead of raising an exception.
  (`#284 <https://github.com/iTwin/reality-capture/pull/284>`_)

----

2.4.1
=====

Additions
---------

- Added ``Checkerboards`` as a new tag type in
  :class:`~reality_capture.specifications.calibration.Tag` for calibration jobs.
  (`#282 <https://github.com/iTwin/reality-capture/pull/282>`_)

Fixes
-----

*(no bug fixes in this release)*

----

2.4.0
=====

Additions
---------

- Added ``3DTilesLOD`` (Level of Detail) as a new Gaussian Splats output format
  (:attr:`~reality_capture.specifications.gaussian_splats.GSFormat.THREED_TILES_LOD`).
  (`#281 <https://github.com/iTwin/reality-capture/pull/281>`_)

Fixes
-----

*(no bug fixes in this release)*

----

2.3.0
=====

Additions
---------

- Added the ``ClearanceCalculation`` job type (Reality Analysis service), along with its specification models,
  inputs (point cloud and building footprints) and outputs (OVF clearance points, lines, and areas).
  (`#278 <https://github.com/iTwin/reality-capture/pull/278>`_)

Fixes
-----

*(no bug fixes in this release)*

----

2.2.0
=====

Additions
---------

- Added the optional ``crs_data`` input field to Modeling job specifications (``Calibration``, ``Constraints``,
  ``GaussianSplats``, ``ImportPointCloud``, ``Production``, ``Reconstruction``, ``Tiling``,
  ``WaterConstraints``), allowing a CRS data file stored in the bucket to be supplied to the job.
  (`#271 <https://github.com/iTwin/reality-capture/pull/271>`_)

Fixes
-----

*(no bug fixes in this release)*

----

2.1.0
=====

Additions
---------

- Added full Reality Analysis service support with the following job types: ``ChangeDetection``,
  ``Objects2D``, ``Segmentation2D``, ``Segmentation3D``, ``SegmentationOrthophoto``,
  ``EvalO2D``, ``EvalO3D``, ``EvalS2D``, ``EvalS3D``, ``EvalSOrtho``.
  (`#266 <https://github.com/iTwin/reality-capture/pull/266>`_)
- Added ``get_jobs()`` to retrieve a paginated list of jobs, with support for filtering and continuation tokens.
  (`#256 <https://github.com/iTwin/reality-capture/pull/256>`_)
- Added Detectors service support: detectors and their versions can now be queried through the service.
  (`#266 <https://github.com/iTwin/reality-capture/pull/266>`_)
- Added new example scripts for Modeling workflows, uploading bucket data, and uploading reality data.
  (`#246 <https://github.com/iTwin/reality-capture/pull/246>`_)

Fixes
-----

- Fixed job specification parsing: the correct specification type is now resolved from the job type when
  reading a job returned by the API, instead of always defaulting to the first type in the union.
  (`#266 <https://github.com/iTwin/reality-capture/pull/266>`_)
- Fixed ``DetectorVersion``: the ``version`` field has been renamed to ``version_number`` to match the API
  response schema.
  (`#266 <https://github.com/iTwin/reality-capture/pull/266>`_)
- Removed the deprecated cost estimation feature (``CostEstimation``).
  (`#266 <https://github.com/iTwin/reality-capture/pull/266>`_)
- Removed discontinued Training job types (``TrainingO2D``, ``TrainingS3D``).
  (`#266 <https://github.com/iTwin/reality-capture/pull/266>`_)
