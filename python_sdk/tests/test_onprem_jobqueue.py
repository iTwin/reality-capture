import datetime
import shutil
import pytest
import os

from babel.plural import value_node
from pydantic import BaseModel, Field

from reality_capture.common.job import JobState
from reality_capture.on_premise.job import JobPriority, JobFilters
from reality_capture.on_premise.job_manager import JobManager
from reality_capture.on_premise.result import ManagerErrorCode
from reality_capture.specifications.calibration import CalibrationSpecifications, CalibrationInputs, CalibrationOutputs


class FakeSpecs(BaseModel):
    fake: str = Field(description="Fake field")


class TestOnPremJobQueue:
    @pytest.fixture(autouse=True)
    def tmp_folder(self, tmp_path):
        self.tmp_dir = str(tmp_path)
        yield
        shutil.rmtree(self.tmp_dir, ignore_errors=True)

    def test_create_get_cancel(self):
        jm = JobManager(self.tmp_dir + "/jq")
        ci = CalibrationInputs(
            scene="path/to/scene",
        )
        co = CalibrationOutputs(
            scene="path/to/calibrated_scene",
        )
        specs = CalibrationSpecifications(inputs=ci, outputs=co)
        job_result = jm.submit_job(specs, self.tmp_dir + "work", workspace=self.tmp_dir + "ws")
        assert not job_result.is_error()
        assert job_result.value is not None
        job = job_result.value

        get_job_result = jm.get_job(job.name)
        assert not get_job_result.is_error()
        assert get_job_result.value is not None
        assert get_job_result.value == job

        set_prio_result = jm.set_job_priority(job.name, JobPriority.URGENT)
        assert not set_prio_result.is_error()
        assert set_prio_result.value is not None
        assert set_prio_result.value.priority == JobPriority.URGENT

        get_job_result = jm.get_job(job.name)
        assert not get_job_result.is_error()
        assert get_job_result.value is not None
        assert get_job_result.value == set_prio_result.value

        get_progress = jm.get_job_progress(job.name)
        assert not get_progress.is_error()
        assert get_progress.value is not None
        assert get_progress.value.state == JobState.QUEUED
        assert get_progress.value.percentage == 0
        assert len(get_progress.value.milestones) == 0

        cancel_result = jm.cancel_job(job.name)
        assert not cancel_result.is_error()
        assert cancel_result.value is not None
        assert cancel_result.value.state == JobState.CANCELLED

        cancel_result = jm.cancel_job(job.name)
        assert cancel_result.is_error()
        assert cancel_result.error == ManagerErrorCode.JOB_NOT_CANCELLABLE

        cancel_result = jm.cancel_job("wrong_name")
        assert cancel_result.is_error()
        assert cancel_result.error == ManagerErrorCode.JOB_NOT_FOUND

    def test_with(self):
        with JobManager(self.tmp_dir + "/jq") as jm:
            res = jm.get_job("wrong_job")
            assert res.is_error()
            assert res.error == ManagerErrorCode.JOB_NOT_FOUND

    @pytest.fixture
    def existing_db(self):
        # Copy data from DB_Jobs to tmp dir
        current_dir = os.path.dirname(os.path.abspath(__file__))
        source_db_path = os.path.join(current_dir, "data", "DB_Jobs")
        target_db_path = os.path.join(self.tmp_dir, "jq")
        shutil.copytree(source_db_path, target_db_path)

    def test_summary(self, existing_db):
        jm = JobManager(self.tmp_dir + "/jq")

        res = jm.get_summary()
        assert not res.is_error()
        assert res.value is not None
        summary = res.value
        assert summary.jobs_queued == 1
        assert len(summary.jobs_active) == 1
        assert summary.jobs_failed == 1
        assert summary.jobs_cancelled == 1
        assert summary.jobs_success == 2
        aj = summary.jobs_active[0]
        assert aj.job_name == "job_d4fc6fa0-8c99-4dff-a7cd-4deb930c4d78"
        assert aj.running_tasks == 1
        assert aj.ready_tasks == 1

    def test_progress(self, existing_db):
        jm = JobManager(self.tmp_dir + "/jq")

        res = jm.get_job_progress("job_d4fc6fa0-8c99-4dff-a7cd-4deb930c4d78")
        assert not res.is_error()
        assert res.value is not None
        progress = res.value
        assert progress.state == JobState.ACTIVE
        assert progress.percentage == 25.009488
        assert len(progress.milestones) == 2

        res = jm.get_job_progress("wrong_job")
        assert res.is_error()
        assert res.error == ManagerErrorCode.JOB_NOT_FOUND

    def test_get_jobs(self, existing_db):
        jm = JobManager(self.tmp_dir + "/jq")
        jf = JobFilters(includeState=[])
        res = jm.get_jobs(jf)
        assert not res.is_error()
        assert res.value is not None
        jp = res.value
        assert jp.next_continuation_token is None
        assert len(jp.jobs) == 0

        jf = JobFilters(limit=2)
        res = jm.get_jobs(jf)
        assert not res.is_error()
        assert res.value is not None
        jp = res.value
        assert jp.next_continuation_token is not None
        assert len(jp.jobs) == 2
        names = [j.name for j in jp.jobs]

        jf = JobFilters(limit=2, continuationToken=jp.next_continuation_token)
        res = jm.get_jobs(jf)
        assert not res.is_error()
        assert res.value is not None
        jp = res.value
        assert jp.next_continuation_token is not None
        assert len(jp.jobs) == 2
        new_names = [j.name for j in jp.jobs]
        assert new_names != names

        jf = JobFilters(includeState=[JobState.QUEUED], limit=2)
        res = jm.get_jobs(jf)
        assert not res.is_error()
        assert res.value is not None
        jp = res.value
        assert jp.next_continuation_token is None
        assert len(jp.jobs) == 1

        sub_time_start = datetime.datetime(2026, 6, 26, 13, 5, 0)
        sub_time_end = datetime.datetime(2026, 6, 26, 13, 10, 0)
        jf = JobFilters(createdDateTimeRange=(sub_time_start, sub_time_end), limit=50)
        res = jm.get_jobs(jf)
        assert not res.is_error()
        assert res.value is not None
        jp = res.value
        assert jp.next_continuation_token is None
        assert len(jp.jobs) == 1
        assert jp.jobs[0].name == "job_6448e60c-a22a-44f7-819e-1a71068feebd"

    def test_submit_unsupported_job_specs(self):
        jm = JobManager(self.tmp_dir + "/jq")
        ci = CalibrationInputs(
            scene="path/to/scene",
        )
        co = CalibrationOutputs(
            scene="path/to/calibrated_scene",
        )
        specs = CalibrationSpecifications(inputs=ci, outputs=co)
        job_result = jm.submit_job(specs, self.tmp_dir + "work")
        assert not job_result.is_error()
        assert job_result.value is not None

    def test_change_priority_of_nonexistent_job(self, existing_db):
        jm = JobManager(self.tmp_dir + "/jq")
        res = jm.set_job_priority("nonexistent_job", JobPriority.HIGH)
        assert res.is_error()
        assert res.error == ManagerErrorCode.JOB_NOT_FOUND

    @pytest.fixture
    def corrupted_db(self):
        # Copy data from DB_Jobs to tmp dir
        current_dir = os.path.dirname(os.path.abspath(__file__))
        source_db_path = os.path.join(current_dir, "data", "DB_Jobs_Corrupted")
        target_db_path = os.path.join(self.tmp_dir, "jq")
        shutil.copytree(source_db_path, target_db_path)

    def test_corrupted_json_specs(self, corrupted_db):
        jm = JobManager(self.tmp_dir + "/jq")
        res = jm.get_job("job_8aaaffdb-e1a2-451e-97de-9fb2cd5ef8b6")
        assert res.is_error()
        assert res.error == ManagerErrorCode.CORRUPTED_SPECIFICATIONS

    def test_missing_specs(self, corrupted_db):
        jm = JobManager(self.tmp_dir + "/jq")
        res = jm.get_job("job_6448e60c-a22a-44f7-819e-1a71068feebd")
        assert res.is_error()
        assert res.error == ManagerErrorCode.MISSING_SPECIFICATIONS

    def test_invalid_job_type(self, corrupted_db):
        jm = JobManager(self.tmp_dir + "/jq")
        res = jm.get_job("job_12083864-05aa-4a5a-b183-6242fec8bfa5")
        assert res.is_error()
        assert res.error == ManagerErrorCode.INVALID_JOB_TYPE_IN_DB

    def test_missing_job_type(self, corrupted_db):
        jm = JobManager(self.tmp_dir + "/jq")
        res = jm.get_job("job_dec6d7f0-aa2a-4d96-9f26-2f1fa7faa5d5")
        assert res.is_error()
        assert res.error == ManagerErrorCode.INVALID_JOB_TYPE_IN_DB

    def test_invalid_spec(self, corrupted_db):
        jm = JobManager(self.tmp_dir + "/jq")
        res = jm.get_job("job_faa0be51-3f34-452b-a4ea-885ebe9015b3")
        assert res.is_error()
        assert res.error == ManagerErrorCode.CORRUPTED_SPECIFICATIONS

    def test_invalid_continuation_token(self, existing_db):
        jm = JobManager(self.tmp_dir + "/jq")
        jf = JobFilters(limit=2, continuationToken="invalid_token")
        res = jm.get_jobs(jf)
        assert res.is_error()
        assert res.error == ManagerErrorCode.INVALID_CONTINUATION_TOKEN

    def test_empty_working_dir(self):
        jm = JobManager(self.tmp_dir + "/jq")
        ci = CalibrationInputs(
            scene="path/to/scene",
        )
        co = CalibrationOutputs(
            scene="path/to/calibrated_scene",
        )
        specs = CalibrationSpecifications(inputs=ci, outputs=co)
        job_result = jm.submit_job(specs, "")
        assert job_result.is_error()
        assert job_result.error == ManagerErrorCode.EMPTY_SHARED_WORKING_DIRECTORY

    def test_db_is_locked(self):
        jm = JobManager(self.tmp_dir + "/jq")
        jm2 = JobManager(self.tmp_dir + "/jq")
        ci = CalibrationInputs(
            scene="path/to/scene",
        )
        co = CalibrationOutputs(
            scene="path/to/calibrated_scene",
        )
        specs = CalibrationSpecifications(inputs=ci, outputs=co)

        db_path = os.path.join(self.tmp_dir, "jq", "JobQueue.db")
        fd = jm2._acquire_lock(db_path, 1)
        assert fd is not None
        try:
            jm._timeout_lock_s = 2  # For speed’s sake
            res = jm.submit_job(specs, self.tmp_dir + "/work")
            assert res.is_error()
            assert res.error == ManagerErrorCode.DB_BUSY

            res = jm.cancel_job("job")
            assert res.is_error()
            assert res.error == ManagerErrorCode.DB_BUSY

            res = jm.set_job_priority("job", JobPriority.NORMAL)
            assert res.is_error()
            assert res.error == ManagerErrorCode.DB_BUSY
        finally:
            jm2._release_lock(fd, db_path)

    def test_db_is_read_only(self, existing_db):
        jq_dir = self.tmp_dir + "/jq"
        for root, dirs, files in os.walk(jq_dir):
            for file in files:
                os.chmod(os.path.join(root, file), 0o444)

        jm = JobManager(jq_dir)
        ci = CalibrationInputs(
            scene="path/to/scene",
        )
        co = CalibrationOutputs(
            scene="path/to/calibrated_scene",
        )
        specs = CalibrationSpecifications(inputs=ci, outputs=co)

        res = jm.submit_job(specs, shared_working_directory="yo")
        assert res.is_error()
        assert res.error == ManagerErrorCode.SQLITE_ERROR

        res = jm.set_job_priority("job_d4fc6fa0-8c99-4dff-a7cd-4deb930c4d78", JobPriority.URGENT)
        assert res.is_error()
        assert res.error == ManagerErrorCode.SQLITE_ERROR

        res = jm.cancel_job("job_d4fc6fa0-8c99-4dff-a7cd-4deb930c4d78")
        assert res.is_error()
        assert res.error == ManagerErrorCode.SQLITE_ERROR

    def test_fake_specs(self, existing_db):
        fs = FakeSpecs(fake="fake")
        jm = JobManager(self.tmp_dir + "/jq")
        res = jm.submit_job(fs, self.tmp_dir + "/work")
        assert res.is_error()
        assert res.error == ManagerErrorCode.UNSUPPORTED_SPECIFICATIONS
