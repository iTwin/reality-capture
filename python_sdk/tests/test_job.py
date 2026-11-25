import datetime
import pytest
from unittest.mock import MagicMock
from reality_capture.service.job import Service, JobCreate, Job, JobType, JobState, _get_appropriate_service
from reality_capture.specifications.eval_o2d import EvalO2DSpecifications
from reality_capture.specifications.tiling import TilingOutputsCreate
from reality_capture.specifications.segmentation3d import Segmentation3DOutputsCreate
from reality_capture.specifications.mesh_optimization import MeshOptimizationSpecificationsCreate
from pydantic import ValidationError
# from reality_capture.specifications.point_cloud_conversion import PCConversionOutputsCreate


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
        pc_conversion_specs = {"inputs": {"pointCloud": "point_cloud"}, "output": "pcId"}
        j = Job(id="id", type=JobType.POINT_CLOUD_CONVERSION, iTwinId="itwin", state=JobState.SUCCESS,
                executionInfo=cdt, userId="claude@example.org", specifications=pc_conversion_specs)
        assert j.get_appropriate_service() == Service.CONVERSION

    def test_appropriate_service_job_create(self):
        tiling_specs = {"inputs": {"scene": "scene"}, "outputs": [TilingOutputsCreate.MODELING_REFERENCE]}
        j = JobCreate(**{"type": JobType.TILING, "iTwinId": "itwin", "specifications": tiling_specs})
        assert j.get_appropriate_service() == Service.MODELING
        eg_specs = {"inputs": {"model3D": "pointClouds"},
                    "outputs": [Segmentation3DOutputsCreate.SEGMENTATION3D,
                                Segmentation3DOutputsCreate.SEGMENTED_MODEL_3D]}
        j = JobCreate(**{"type": JobType.SEGMENTATION_3D, "iTwinId": "itwin", "specifications": eg_specs})
        assert j.get_appropriate_service() == Service.ANALYSIS
        pc_conversion_specs = {"inputs": {"pointCloud": "point_cloud"}}
        j = JobCreate(**{"type": JobType.POINT_CLOUD_CONVERSION, "iTwinId": "itwin", "specifications": pc_conversion_specs})
        assert j.get_appropriate_service() == Service.CONVERSION

    def test_get_appropriate_service_unsupported_job_type(self):
        unsupported = MagicMock(name="UnsupportedJobType")
        with pytest.raises(NotImplementedError):
            _get_appropriate_service(unsupported)

    @pytest.mark.parametrize("options, serialized_options", [
        (None, None),
        ({"outputCrs": "EPSG:4978"}, {"outputFormat": None, "outputCrs": "EPSG:4978"}),
        ({"outputFormat": "3DTiles_1.1", "outputCrs": "EPSG:4978"},
         {"outputFormat": "3DTiles_1.1", "outputCrs": "EPSG:4978"}),
    ])
    def test_create_mesh_optimization_uses_correct_specifications(self, options, serialized_options):
        j = JobCreate(type=JobType.MESH_OPTIMIZATION, iTwinId="itwin",
                      specifications={"inputs": {"meshes": ["mesh"]}, "options": options})
        assert isinstance(j.specifications, MeshOptimizationSpecificationsCreate)
        assert j.get_appropriate_service() == Service.CONVERSION
        data = j.model_dump(mode="json", by_alias=True)
        assert data["specifications"] == {"inputs": {"meshes": ["mesh"]}, "options": serialized_options}

    def test_create_mesh_optimization_rejects_mesh_sampling_format(self):
        with pytest.raises(ValidationError):
            JobCreate(type=JobType.MESH_OPTIMIZATION, iTwinId="itwin", specifications={
                "inputs": {"meshes": ["mesh"]}, "options": {"outputFormat": "3DTilesGLBC"}
            })

