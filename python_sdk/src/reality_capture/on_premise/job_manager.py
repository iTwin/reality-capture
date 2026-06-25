from datetime import datetime, timezone
from typing import Union, Optional
import uuid
import os
import json
import shutil
import socket
import getpass
import base64
import sqlite3

from reality_capture.on_premise._generic_manager import (
    GenericManager,
    JOBS, JOBNAME, STATUS, PRIORITY, SHARED_WORKING_DIR,
    JOB_TYPE, SUBMIT_USER, SUBMIT_HOST, SUBMIT_TIME, START_TIME, END_TIME,
    PERCENT, TASK_TABLE, MILESTONE, RETVAL, DEPS_TABLE,
    DESCR, LAST_MSG, STEPS, CURRENT_STEP, JOB_VERSION, JOB_COMPUTE_VERSION,
    JOB_CURRENT_VERSION,
)

from reality_capture.specifications.calibration import CalibrationSpecifications
from reality_capture.specifications.change_detection import ChangeDetectionSpecifications
from reality_capture.specifications.constraints import ConstraintsSpecifications
from reality_capture.specifications.fill_image_properties import FillImagePropertiesSpecifications
from reality_capture.specifications.import_point_cloud import ImportPCSpecifications
from reality_capture.specifications.objects2d import Objects2DSpecifications
from reality_capture.specifications.production import ProductionSpecifications
from reality_capture.specifications.reconstruction import ReconstructionSpecifications
from reality_capture.specifications.segmentation2d import Segmentation2DSpecifications
from reality_capture.specifications.segmentation3d import Segmentation3DSpecifications
from reality_capture.specifications.segmentation_orthophoto import SegmentationOrthophotoSpecifications
from reality_capture.specifications.tiling import TilingSpecifications
from reality_capture.specifications.touchup import (TouchUpImportSpecifications, TouchUpExportSpecifications)
from reality_capture.specifications.water_constraints import WaterConstraintsSpecifications
from reality_capture.specifications.gaussian_splats import GaussianSplatsSpecifications
from reality_capture.specifications.eval_o2d import EvalO2DSpecifications
from reality_capture.specifications.eval_o3d import EvalO3DSpecifications
from reality_capture.specifications.eval_s2d import EvalS2DSpecifications
from reality_capture.specifications.eval_s3d import EvalS3DSpecifications
from reality_capture.specifications.eval_sortho import EvalSOrthoSpecifications

from reality_capture.common.job import JobState, JobType
from reality_capture.on_premise.job import (Job, JobPriority, ExecutionOnPrem, Progress, Milestone, JobFilters,
                                            JobPage, QueueSummary, ActiveJob)
from reality_capture.on_premise.result import Result, JobDetailsError

class JobManager(GenericManager):
    def __init__(self, job_queue_dir: str):
        super().__init__(job_queue_dir)
        self._db_path = self._job_queue_dir + "/JobQueue.db"
        self._connection = sqlite3.connect(self._db_path)

    def _close(self):
        if self._connection is not None:
            self._connection.close()
            self._connection = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self._close()
        return False

    def __del__(self):
        self._close()

    @staticmethod
    def _int_to_priority(jp: int) -> JobPriority:
        mapping = {
            -1: JobPriority.PAUSED,
            0: JobPriority.LOW,
            1: JobPriority.NORMAL,
            2: JobPriority.HIGH,
            3: JobPriority.URGENT,
        }
        if jp in mapping:
            return mapping[jp]
        return JobPriority.NORMAL

    @staticmethod
    def _priority_to_int(jp: JobPriority) -> int:
        mapping = {
            JobPriority.PAUSED: -1,
            JobPriority.LOW: 0,
            JobPriority.NORMAL: 1,
            JobPriority.HIGH: 2,
            JobPriority.URGENT: 3,
        }
        return mapping.get(jp, 1)

    @staticmethod
    def _int_to_state(si: int) -> JobState:
        # C++ enum values (DB stores sum of status history, we want the highest)
        # Pending=0x1, Running=0x4, Completed=0x8, Failed=0x10, Cancelled=0x20
        mapping = [
            (0x20, JobState.CANCELLED),
            (0x10, JobState.FAILED),
            (0x08, JobState.SUCCESS),
            (0x04, JobState.ACTIVE),
            (0x01, JobState.QUEUED),
        ]
        for flag, state in mapping:
            if si & flag:
                return state
        return JobState.QUEUED

    _STATE_SQL_MAP = {
        JobState.QUEUED:    f"({STATUS} & 1) AND NOT ({STATUS} & 60)",
        JobState.ACTIVE:    f"({STATUS} & 4) AND NOT ({STATUS} & 56)",
        JobState.SUCCESS:   f"({STATUS} & 8) AND NOT ({STATUS} & 48)",
        JobState.FAILED:    f"({STATUS} & 16) AND NOT ({STATUS} & 32)",
        JobState.CANCELLED: f"({STATUS} & 32)",
    }

    _SPECS_TYPE_TO_JOB_TYPE = {
        CalibrationSpecifications: JobType.CALIBRATION,
        ChangeDetectionSpecifications: JobType.CHANGE_DETECTION,
        ConstraintsSpecifications: JobType.CONSTRAINTS,
        EvalO2DSpecifications: JobType.EVAL_O2D,
        EvalO3DSpecifications: JobType.EVAL_O3D,
        EvalS2DSpecifications: JobType.EVAL_S2D,
        EvalS3DSpecifications: JobType.EVAL_S3D,
        EvalSOrthoSpecifications: JobType.EVAL_SORTHO,
        FillImagePropertiesSpecifications: JobType.FILL_IMAGE_PROPERTIES,
        GaussianSplatsSpecifications: JobType.GAUSSIAN_SPLATS,
        ImportPCSpecifications: JobType.IMPORT_POINT_CLOUD,
        Objects2DSpecifications: JobType.OBJECTS_2D,
        ProductionSpecifications: JobType.PRODUCTION,
        ReconstructionSpecifications: JobType.RECONSTRUCTION,
        Segmentation2DSpecifications: JobType.SEGMENTATION_2D,
        Segmentation3DSpecifications: JobType.SEGMENTATION_3D,
        SegmentationOrthophotoSpecifications: JobType.SEGMENTATION_ORTHOPHOTO,
        TilingSpecifications: JobType.TILING,
        TouchUpExportSpecifications: JobType.TOUCH_UP_EXPORT,
        TouchUpImportSpecifications: JobType.TOUCH_UP_IMPORT,
        WaterConstraintsSpecifications: JobType.WATER_CONSTRAINTS,
    }

    def _row_to_job_details(self, row) -> Result[Job]:
        (name, status, priority, shared_working_dir, job_type,
         submit_user, submit_host, submit_time, start_time, end_time) = row

        execution_info = ExecutionOnPrem(
            submitUser=submit_user,
            submitHost=submit_host or "",
            createdDateTime=self._parse_datetime(submit_time),
            startedDateTime=self._parse_datetime(start_time) if start_time else None,
            endedDateTime=self._parse_datetime(end_time) if end_time else None,
        )

        # Load specifications from disk
        # Format is jobqueue_dir/jobs/job_id/settings.json
        settings_path = os.path.join(self._job_queue_dir, "jobs", name, "settings.json")
        if os.path.exists(settings_path):
            try:
                with open(settings_path, "r", encoding="utf-8") as f:
                    specs = json.load(f)
            except Exception:
                return Result(JobDetailsError.CORRUPTED_SPECIFICATIONS, None)



        if not job_type:
            return Result(JobDetailsError.INVALID_JOB_TYPE_IN_DB, None)
        try:
            job_type_enum = JobType(job_type)
        except ValueError:
            return Result(JobDetailsError.INVALID_JOB_TYPE_IN_DB, None)

        j = Job(
            name=name,
            priority=self._int_to_priority(priority),
            place=0,
            processingHosts=[],
            state=self._int_to_state(status),
            executionInfo=execution_info,
            type=job_type_enum,
            sharedWorkingDir=shared_working_dir or "",
            specifications=specs,
        )
        return Result(None, j)

    def get_job(self, job_name: str) -> Result[Job]:
        """
        Retrieve job details from the JobQueue.

        :param job_name: Name of the job to retrieve.
        :return: The job details retrieved from the JobQueue.
        """
        cursor = self._connection.cursor()
        cursor.execute(
            f"SELECT {JOBNAME}, {STATUS}, {PRIORITY}, {SHARED_WORKING_DIR}, "
            f"{JOB_TYPE}, {SUBMIT_USER}, {SUBMIT_HOST}, {SUBMIT_TIME}, "
            f"{START_TIME}, {END_TIME} "
            f"FROM {JOBS} WHERE {JOBNAME} = ?;",
            (job_name,)
        )
        row = cursor.fetchone()
        if row is None:
            raise ValueError(f"Job '{job_name}' not found")

        return self._row_to_job_details(row)

    def get_job_progress(self, job_name: str) -> Result[Progress]:
        """
        Retrieve job progress from the JobQueue.

        :param job_name: Name of the job to retrieve.
        :return: The job progress.
        """
        cursor = self._connection.cursor()

        # Retrieve percent and Status from the Jobs table
        cursor.execute(
            f"SELECT {PERCENT}, {STATUS} FROM {JOBS} WHERE {JOBNAME} = ?;",
            (job_name,)
        )
        job_row = cursor.fetchone()
        if job_row is None:
            return Result(JobDetailsError.JOB_NOT_FOUND, None)

        percent, status = job_row
        state = self._int_to_state(status)

        # Retrieve Milestone, EndTime, and RetVal from the Tasks table
        cursor.execute(
            f"SELECT {MILESTONE}, {END_TIME}, {RETVAL} FROM {TASK_TABLE} WHERE {JOBNAME} = ?;",
            (job_name,)
        )
        task_rows = cursor.fetchall()

        milestones = []
        for milestone, end_time, ret_val in task_rows:
            if milestone is None:
                continue

            # Milestone string is of format Name$Rank$Param1$Param2$...
            # Params are optional and can be empty; Name and Rank are always there
            splits = milestone.split("$")
            if len(splits) < 2:
                continue
            m = Milestone(name=splits[0], parameters=splits[2:])
            m.end_time = self._parse_datetime(end_time) if end_time and ret_val == 0 else None
            milestones.append(m)

        p = Progress(
            state=state,
            percentage=percent,
            milestones=milestones
        )
        return Result(None, p)

    def get_jobs(self, job_filters: JobFilters) -> Result[JobPage]:
        """
        Retrieve jobs from the JobQueue based on specified job filters. Use a continuation token to get the next page of jobs.

        :param job_filters: Job filters to filter jobs on.
        :return: The job page retrieved from the JobQueue.
        """
        if job_filters.include_state is not None and len(job_filters.include_state) == 0:
            return Result(None, JobPage(jobs=[], next_continuation_token=None))

        where_clauses: list[str] = []
        params: list = []

        # State filter
        if job_filters.include_state is not None:
            state_conditions = [
                f"({self._STATE_SQL_MAP[s]})" for s in job_filters.include_state
            ]
            where_clauses.append(f"({' OR '.join(state_conditions)})")

        # Datetime range filters
        dt_range_mappings = [
            (job_filters.created_date_time_range, SUBMIT_TIME),
            (job_filters.started_date_time_range, START_TIME),
            (job_filters.ended_date_time_range, END_TIME),
        ]
        for dt_range, column in dt_range_mappings:
            if dt_range is not None:
                where_clauses.append(f"{column} BETWEEN ? AND ?")
                params.append(self._format_datetime(dt_range[0]))
                params.append(self._format_datetime(dt_range[1]))

        # Continuation token (keyset pagination via ROWID)
        if job_filters.continuation_token is not None:
            try:
                last_rowid = int(base64.b64decode(job_filters.continuation_token).decode())
            except Exception:
                raise ValueError("Invalid continuation token")
            where_clauses.append("ROWID > ?")
            params.append(last_rowid)

        # Build query
        job_columns = (
            f"ROWID, {JOBNAME}, {STATUS}, {PRIORITY}, {SHARED_WORKING_DIR}, "
            f"{JOB_TYPE}, {SUBMIT_USER}, {SUBMIT_HOST}, {SUBMIT_TIME}, "
            f"{START_TIME}, {END_TIME}"
        )
        query = f"SELECT {job_columns} FROM {JOBS}"
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
        query += " ORDER BY ROWID ASC LIMIT ?"
        params.append(job_filters.limit + 1)

        cursor = self._connection.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()

        # Determine if there's a next page
        next_token: Optional[str] = None
        if len(rows) > job_filters.limit:
            rows = rows[:job_filters.limit]
            last_rowid = rows[-1][0]  # ROWID is the first column
            next_token = base64.b64encode(str(last_rowid).encode()).decode()

        # Map rows to JobDetails (skip ROWID at index 0)
        jobs_result = [self._row_to_job_details(row[1:]) for row in rows]
        jobs: list[Job] = []
        for j in jobs_result:
            if j.error is None and j.value is not None:
                jobs.append(j.value)
        return Result(None, JobPage(jobs=jobs, next_continuation_token=next_token))

    def get_summary(self) -> Result[QueueSummary]:
        """
        Produce a quick summary of the job queue, including counts of jobs in various states and a list of active jobs with their running and ready task counts.

        :return: The job queue summary.
        """
        cursor = self._connection.cursor()

        # Count jobs by state
        cursor.execute(
            f"SELECT {STATUS} FROM {JOBS};"
        )
        rows = cursor.fetchall()

        jobs_failed = 0
        jobs_success = 0
        jobs_cancelled = 0
        jobs_queued = 0

        for (status,) in rows:
            state = self._int_to_state(status)
            if state == JobState.FAILED:
                jobs_failed += 1
            elif state == JobState.SUCCESS:
                jobs_success += 1
            elif state == JobState.CANCELLED:
                jobs_cancelled += 1
            elif state == JobState.QUEUED:
                jobs_queued += 1

        # Get active jobs with their task counts
        cursor.execute(
            f"SELECT j.{JOBNAME}, t.{STATUS} FROM {JOBS} j "
            f"INNER JOIN {TASK_TABLE} t ON j.{JOBNAME} = t.{JOBNAME} "
            f"WHERE (j.{STATUS} & 4) AND NOT (j.{STATUS} & 56);"
        )
        task_rows = cursor.fetchall()

        # Aggregate running/ready tasks per active job
        active_jobs_map: dict[str, tuple[int, int]] = {}
        for job_name, task_status in task_rows:
            running, ready = active_jobs_map.get(job_name, (0, 0))
            # Running: bit 4 set, bits 8/16/32 not set
            if (task_status & 4) and not (task_status & (8 | 16 | 32)):
                running += 1
            # Ready: bit 2 set, bits 4/8/16/32 not set
            elif (task_status & 2) and not (task_status & (4 | 8 | 16 | 32)):
                ready += 1
            active_jobs_map[job_name] = (running, ready)

        jobs_active = [
            ActiveJob(jobName=name, runningTasks=running, readyTasks=ready)
            for name, (running, ready) in active_jobs_map.items()
        ]
        qs = QueueSummary(
            jobsFailed=jobs_failed,
            jobsSuccess=jobs_success,
            jobsCancelled=jobs_cancelled,
            jobsQueued=jobs_queued,
            jobsActive=jobs_active,
        )

        return Result(None, qs)

    def submit_job(self, specifications: Union[CalibrationSpecifications, ChangeDetectionSpecifications, ConstraintsSpecifications,
                                               EvalO2DSpecifications, EvalO3DSpecifications,
                                               EvalS2DSpecifications, EvalS3DSpecifications,
                                               EvalSOrthoSpecifications, FillImagePropertiesSpecifications,
                                               GaussianSplatsSpecifications, ImportPCSpecifications,
                                               Objects2DSpecifications, ProductionSpecifications,
                                               ReconstructionSpecifications, Segmentation2DSpecifications,
                                               Segmentation3DSpecifications, SegmentationOrthophotoSpecifications,
                                               TilingSpecifications, TouchUpExportSpecifications,
                                               TouchUpImportSpecifications, WaterConstraintsSpecifications],
                   shared_working_directory: str,
                   priority: JobPriority = JobPriority.NORMAL, workspace: Optional[str] = None) -> Result[Job]:
        """
        Submit a job to the job queue.

        :param specifications: The specifications of the job
        :param shared_working_directory: The shared working directory unique to this job
        :param priority: The priority of the job
        :param workspace: The workspace to leverage for the job.
        :return: The job details of the submitted job.
        """
        if not shared_working_directory:
            return Result(JobDetailsError.EMPTY_SHARED_WORKING_DIRECTORY, None)
        fd = self._acquire_lock(self._db_path, timeout=30.0)
        try:
            cursor = self._connection.cursor()
            cursor.execute("BEGIN IMMEDIATE")

            job_name = f"job_{uuid.uuid4()}"
            submit_time = self._format_datetime(datetime.now(timezone.utc))
            submit_user = getpass.getuser()
            submit_host = socket.gethostname()

            # Derive job type from specifications type
            job_type_enum = self._SPECS_TYPE_TO_JOB_TYPE.get(type(specifications))
            if job_type_enum is None:
                return Result(JobDetailsError.UNSUPPORTED_SPECIFICATIONS, None)
            job_type = job_type_enum.value

            # Dump specifications as a json {"{jobType}": { specifications }}
            if hasattr(specifications, "model_dump"):
                specs_dict = specifications.model_dump(by_alias=True, exclude_none=True)
            else:
                specs_dict = dict(specifications)
            specifications_payload = {job_type: specs_dict}

            # Save specifications to disk
            settings_dir = os.path.join(self._job_queue_dir, "jobs", job_name)
            os.makedirs(settings_dir, exist_ok=True)
            settings_path = os.path.join(settings_dir, "settings.json")
            with open(settings_path, "w", encoding="utf-8") as f:
                if workspace is not None and workspace != "":
                    specifications_payload[job_type].setdefault("options", {})["workspace"] = workspace
                json.dump(specifications_payload, f, indent=2)

            # Insert job into database
            try:
                cursor.execute(
                    f"INSERT INTO {JOBS} ("
                    f"{JOBNAME}, {STATUS}, {PRIORITY}, {PERCENT}, {DESCR}, "
                    f"{SHARED_WORKING_DIR}, {JOB_TYPE}, {SUBMIT_USER}, {SUBMIT_HOST}, "
                    f"{SUBMIT_TIME}, {START_TIME}, {END_TIME}, {LAST_MSG}, "
                    f"{STEPS}, {CURRENT_STEP}, {JOB_VERSION}, {JOB_COMPUTE_VERSION}"
                    f") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
                    (
                        job_name,
                        1,  # Pending status
                        self._priority_to_int(priority),
                        0.0,
                        "",  # description
                        shared_working_directory,
                        job_type,
                        submit_user,
                        submit_host,
                        submit_time,
                        None,  # start_time
                        None,  # end_time
                        None,  # last_msg
                        "Prepare_Job",  # steps
                        None,  # current_step
                        JOB_CURRENT_VERSION,
                        "",  # compute_version
                    )
                )
                self._connection.commit()
            except Exception as e:
                shutil.rmtree(settings_dir, ignore_errors=True)
                self._connection.rollback()
                return Result(JobDetailsError.SQLITE_ERROR, None)
        finally:
            self._release_lock(fd, self._db_path)

        return self.get_job(job_name)

    def set_job_priority(self, job_name: str, job_priority: JobPriority) -> Result[Job]:
        """
        Update the priority of the job

        :param job_name: The name of the job
        :param job_priority: The priority of the job
        :return: The job details of the updated job
        """
        fd = self._acquire_lock(self._db_path, timeout=30.0)
        try:
            cursor = self._connection.cursor()
            cursor.execute("BEGIN IMMEDIATE")

            try:
                cursor.execute(
                    f"UPDATE {JOBS} SET {PRIORITY} = ? WHERE {JOBNAME} = ?;",
                    (self._priority_to_int(job_priority), job_name)
                )
                if cursor.rowcount != 1:
                    return Result(JobDetailsError.SQLITE_ERROR, None)
                self._connection.commit()
            except Exception as e:
                self._connection.rollback()
                return Result(JobDetailsError.SQLITE_ERROR, None)
        finally:
            self._release_lock(fd, self._db_path)

        return self.get_job(job_name)

    def cancel_job(self, job_name: str) -> Result[Job]:
        """
        Cancel a specific job

        :param job_name: The name of the job to cancel
        :return: The job details of the cancelled job
        """
        cancelled_mask = 0x20  # 32
        final_state_mask = 0x38  # 56 = Completed(0x08) | Failed(0x10) | Cancelled(0x20)

        fd = self._acquire_lock(self._db_path, timeout=30.0)
        try:
            cursor = self._connection.cursor()
            cursor.execute("BEGIN IMMEDIATE")

            try:
                # Fetch current status and shared working directory
                cursor.execute(
                    f"SELECT {STATUS}, {SHARED_WORKING_DIR} FROM {JOBS} WHERE {JOBNAME} = ?;",
                    (job_name,)
                )
                row = cursor.fetchone()
                if row is None:
                    raise ValueError(f"Job '{job_name}' not found")

                status, shared_working_dir = row
                shared_working_dir = shared_working_dir or ""

                # Validate: only pending (0x1) or pending+running (0x5) jobs can be cancelled
                if status & final_state_mask:
                    raise RuntimeError(
                        f"Job '{job_name}' cannot be cancelled (current status: {status})"
                    )

                cancel_time = self._format_datetime(datetime.now(timezone.utc))

                # Update job status, end time, and last message
                cursor.execute(
                    f"UPDATE {JOBS} SET "
                    f"{STATUS} = {STATUS} | {cancelled_mask}, "
                    f"{END_TIME} = ?, "
                    f"{LAST_MSG} = ? "
                    f"WHERE {JOBNAME} = ?;",
                    (cancel_time, "Job has been cancelled", job_name)
                )

                # Cancel not-finished tasks (tasks without any final state bit set)
                cursor.execute(
                    f"UPDATE {TASK_TABLE} SET "
                    f"{STATUS} = {STATUS} | {cancelled_mask}, "
                    f"{END_TIME} = ? "
                    f"WHERE {JOBNAME} = ? AND ({STATUS} & {final_state_mask}) = 0;",
                    (cancel_time, job_name)
                )

                # Delete dependencies for this job
                cursor.execute(
                    f"DELETE FROM {DEPS_TABLE} WHERE {JOBNAME} = ?;",
                    (job_name,)
                )

                self._connection.commit()
            except Exception as e:
                self._connection.rollback()
                return Result(JobDetailsError.SQLITE_ERROR, None)
        finally:
            self._release_lock(fd, self._db_path)

        # Delete shared working directory (after lock release, non-reversible)
        if shared_working_dir:
            shutil.rmtree(shared_working_dir, ignore_errors=True)

        return self.get_job(job_name)
