import datetime
import pytest
from unittest.mock import MagicMock
from reality_capture.service.job import Service, JobCreate, Job, JobType, JobState, _get_appropriate_service
from reality_capture.specifications.eval_o2d import EvalO2DSpecifications
from reality_capture.specifications.tiling import TilingOutputsCreate
from reality_capture.specifications.segmentation3d import Segmentation3DOutputsCreate


class TestJob:
    def test_appropriate_service_job(self):
        cdt = datetime.datetime(1974, 9, 1, 0, 0, 0)
        cdt = {"createdDateTime": cdt, "startedDateTime": None, "endedDateTime": None, "estimatedUnits": None}
        tiling_specs = {"inputs": {"scene": "scene"}, "outputs": {"modelingReference": {"location": "location"}}}
        j = Job(id="id", type=JobType.TILING, iTwinId="itwin", state=JobState.SUCCESS, executionInfo=cdt,
                userId="claude@example.org", specifications=tiling_specs)
        assert j.get_appropriate_service() == Service.MODELING
        specs = {"inputs": {"reference": "ref", "prediction": "pred"}, "outputs": {"objects2D": "objects2d"}}
        j = Job(id="id", type=JobType.EVAL_O2D, iTwinId="itwin", state=JobState.SUCCESS, executionInfo=cdt,
                userId="claude@example.org", specifications=specs)
        assert j.get_appropriate_service() == Service.ANALYSIS

    def test_appropriate_service_job_create(self):
        tiling_specs = {"inputs": {"scene": "scene"}, "outputs": [TilingOutputsCreate.MODELING_REFERENCE]}
        j = JobCreate(**{"type": JobType.TILING, "iTwinId": "itwin", "specifications": tiling_specs})
        assert j.get_appropriate_service() == Service.MODELING
        eg_specs = {"inputs": {"model3D": "pointClouds"},
                    "outputs": [Segmentation3DOutputsCreate.SEGMENTATION3D,
                                Segmentation3DOutputsCreate.SEGMENTED_MODEL_3D]}
        j = JobCreate(**{"type": JobType.SEGMENTATION_3D, "iTwinId": "itwin", "specifications": eg_specs})
        assert j.get_appropriate_service() == Service.ANALYSIS

    def test_get_appropriate_service_unsupported_job_type(self):
        unsupported = MagicMock(name="UnsupportedJobType")
        with pytest.raises(NotImplementedError):
            _get_appropriate_service(unsupported)

