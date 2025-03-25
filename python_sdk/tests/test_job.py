import datetime
from reality_capture.service.job import Service, JobCreate, Job, JobType, JobState


class TestJob:
    def test_appropriate_service_job(self):
        cdt = datetime.datetime(1974, 9, 1, 0, 0, 0)
        cdt = {"creationDateTime": cdt, "startDateTime": None, "endDateTime": None, "estimatedUnits": None}
        ts = {"inputs": {"scene": "scene"}, "outputs": {"reference_model": {"location": "location"}}}
        j = Job(id="id", type=JobType.TILING, itwin="itwin", state=JobState.SUCCESS, execution=cdt,
                user="claude@example.org", specifications=ts)
        assert j.get_appropriate_service() == Service.MODELING
        j = Job(id="id", type=JobType.TRAINING_O2D, itwin="itwin", state=JobState.SUCCESS, execution=cdt,
                user="claude@example.org", specifications=ts)
        assert j.get_appropriate_service() == Service.ANALYSIS
        j = Job(id="id", type=JobType.POINT_CLOUD_CONVERSION, itwin="itwin", state=JobState.SUCCESS, execution=cdt,
                user="claude@example.org", specifications=ts)
        assert j.get_appropriate_service() == Service.CONVERSION

    def test_appropriate_service_job_create(self):
        ts = {"inputs": {"scene": "scene"}, "outputs": {"reference_model": {"location": "location"}}}
        j = JobCreate(**{"type": JobType.TILING, "itwin": "itwin", "specifications": ts})
        assert j.get_appropriate_service() == Service.MODELING
        j = JobCreate(**{"type": JobType.EXTRACT_GROUND, "itwin": "itwin", "specifications": ts})
        assert j.get_appropriate_service() == Service.ANALYSIS
        j = JobCreate(**{"type": JobType.POINT_CLOUD_CONVERSION, "itwin": "itwin", "specifications": ts})
        assert j.get_appropriate_service() == Service.CONVERSION
