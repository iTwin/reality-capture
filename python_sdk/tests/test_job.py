import datetime
from reality_capture.service.job import Service, JobCreate, Job, JobType, JobState


class TestJob:
    def test_appropriate_service_job(self):
        cdt = datetime.datetime(1974, 9, 1, 0, 0, 0)
        cdt = {"createdDateTime": cdt, "startedDateTime": None, "endedDateTime": None, "estimatedUnits": None}
        tiling_specs = {"inputs": {"scene": "scene"}, "outputs": {"referenceModel": {"location": "location"}}}
        j = Job(id="id", type=JobType.TILING, iTwinId="itwin", state=JobState.SUCCESS, executionInfo=cdt,
                userId="claude@example.org", specifications=tiling_specs, bucketId="bucket")
        assert j.get_appropriate_service() == Service.MODELING
        training_specs = {"inputs": {"scene": "scene"}, "outputs": {"detector": "detector"}}
        j = Job(id="id", type=JobType.TRAINING_O2D, iTwinId="itwin", state=JobState.SUCCESS, executionInfo=cdt,
                userId="claude@example.org", specifications=training_specs, bucketId="bucket")
        assert j.get_appropriate_service() == Service.ANALYSIS
        pc_conversion_specs = {"inputs": {"pointClouds": ["point_cloud"]}, "outputs": {"opc": "opc"}}
        j = Job(id="id", type=JobType.POINT_CLOUD_CONVERSION, iTwinId="itwin", state=JobState.SUCCESS,
                executionInfo=cdt, userId="claude@example.org", specifications=pc_conversion_specs, bucketId="bucket")
        assert j.get_appropriate_service() == Service.CONVERSION

    def test_appropriate_service_job_create(self):
        tiling_specs = {"inputs": {"scene": "scene"}, "outputs": {"referenceModel": {"location": "location"}}}
        j = JobCreate(**{"type": JobType.TILING, "iTwinId": "itwin", "specifications": tiling_specs})
        assert j.get_appropriate_service() == Service.MODELING
        eg_specs = {"inputs": {"pointClouds": "pointClouds"}, "outputs": {"segmentation3d": "segmentation3d",
                                                                          "segmentedPointCloud": "segmentedPointCloud"}}
        j = JobCreate(**{"type": JobType.EXTRACT_GROUND, "iTwinId": "itwin", "specifications": eg_specs})
        assert j.get_appropriate_service() == Service.ANALYSIS
        pc_conversion_specs = {"inputs": {"pointClouds": ["point_cloud"]}, "outputs": {"opc": "opc"}}
        j = JobCreate(**{"type": JobType.POINT_CLOUD_CONVERSION, "iTwinId": "itwin",
                         "specifications": pc_conversion_specs})
        assert j.get_appropriate_service() == Service.CONVERSION
