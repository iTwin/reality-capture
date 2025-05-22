import datetime
from reality_capture.service.job import Service, JobCreate, Job, JobType, JobState


class TestJob:
    def test_appropriate_service_job(self):
        cdt = datetime.datetime(1974, 9, 1, 0, 0, 0)
        cdt = {"createdDateTime": cdt, "startedDateTime": None, "endedDateTime": None, "estimatedUnits": None}
        ts = {"inputs": {"scene": "scene"}, "outputs": {"referenceModel": {"location": "location"}}}
        j = Job(id="id", type=JobType.TILING, iTwinId="itwin", state=JobState.SUCCESS, executionInfo=cdt,
                userId="claude@example.org", specifications=ts, bucketId="bucket")
        assert j.get_appropriate_service() == Service.MODELING
        j = Job(id="id", type=JobType.TRAINING_O2D, iTwinId="itwin", state=JobState.SUCCESS, executionInfo=cdt,
                userId="claude@example.org", specifications=ts, bucketId="bucket")
        assert j.get_appropriate_service() == Service.ANALYSIS
        j = Job(id="id", type=JobType.POINT_CLOUD_CONVERSION, iTwinId="itwin", state=JobState.SUCCESS,
                executionInfo=cdt, userId="claude@example.org", specifications=ts, bucketId="bucket")
        assert j.get_appropriate_service() == Service.CONVERSION

    def test_appropriate_service_job_create(self):
        ts = {"inputs": {"scene": "scene"}, "outputs": {"referenceModel": {"location": "location"}}}
        j = JobCreate(**{"type": JobType.TILING, "iTwinId": "itwin", "specifications": ts})
        assert j.get_appropriate_service() == Service.MODELING
        j = JobCreate(**{"type": JobType.EXTRACT_GROUND, "iTwinId": "itwin", "specifications": ts})
        assert j.get_appropriate_service() == Service.ANALYSIS
        j = JobCreate(**{"type": JobType.POINT_CLOUD_CONVERSION, "iTwinId": "itwin", "specifications": ts})
        assert j.get_appropriate_service() == Service.CONVERSION
