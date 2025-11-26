import datetime
from reality_capture.service.job import Service, JobCreate, Job, JobType, JobState
from reality_capture.specifications.tiling import TilingOutputsCreate
from reality_capture.specifications.segmentation3d import Segmentation3DOutputsCreate
# from reality_capture.specifications.point_cloud_conversion import PCConversionOutputsCreate


class TestJob:
    def test_appropriate_service_job(self):
        cdt = datetime.datetime(1974, 9, 1, 0, 0, 0)
        cdt = {"createdDateTime": cdt, "startedDateTime": None, "endedDateTime": None, "estimatedUnits": None}
        tiling_specs = {"inputs": {"scene": "scene"}, "outputs": {"modelingReference": {"location": "location"}}}
        j = Job(id="id", type=JobType.TILING, iTwinId="itwin", state=JobState.SUCCESS, executionInfo=cdt,
                userId="claude@example.org", specifications=tiling_specs, bucketId="bucket")
        assert j.get_appropriate_service() == Service.MODELING
        training_specs = {"inputs": {"scene": "scene"}, "outputs": {"detector": "detector"}}
        j = Job(id="id", type=JobType.TRAINING_O2D, iTwinId="itwin", state=JobState.SUCCESS, executionInfo=cdt,
                userId="claude@example.org", specifications=training_specs, bucketId="bucket")
        assert j.get_appropriate_service() == Service.ANALYSIS
        # pc_conversion_specs = {"inputs": {"pointClouds": ["point_cloud"]}, "outputs": {"opc": "opc"}}
        # j = Job(id="id", type=JobType.POINT_CLOUD_CONVERSION, iTwinId="itwin", state=JobState.SUCCESS,
        #         executionInfo=cdt, userId="claude@example.org", specifications=pc_conversion_specs, bucketId="bucket")
        # assert j.get_appropriate_service() == Service.CONVERSION

    def test_appropriate_service_job_create(self):
        tiling_specs = {"inputs": {"scene": "scene"}, "outputs": [TilingOutputsCreate.MODELING_REFERENCE]}
        j = JobCreate(**{"type": JobType.TILING, "iTwinId": "itwin", "specifications": tiling_specs})
        assert j.get_appropriate_service() == Service.MODELING
        eg_specs = {"inputs": {"model3D": "pointClouds"},
                    "outputs": [Segmentation3DOutputsCreate.SEGMENTATION3D,
                                Segmentation3DOutputsCreate.SEGMENTED_POINT_CLOUD]}
        j = JobCreate(**{"type": JobType.SEGMENTATION_3D, "iTwinId": "itwin", "specifications": eg_specs})
        # assert j.get_appropriate_service() == Service.ANALYSIS
        # pc_conversion_specs = {"inputs": {"pointClouds": ["point_cloud"]}, "outputs": PCConversionOutputsCreate.OPC}
        # j = JobCreate(**{"type": JobType.POINT_CLOUD_CONVERSION, "iTwinId": "itwin", "specifications": pc_conversion_specs})
        # assert j.get_appropriate_service() == Service.CONVERSION
