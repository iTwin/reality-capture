import os
import sqlite3
import time
from datetime import datetime

# Constants

## Version
DB_CURRENT_VERSION = "1.3"
JOB_CURRENT_VERSION = "2.0"

## Table names
JOBS = "Jobs"
TASK_TABLE = "Tasks"
DEPS_TABLE = "Dependencies"
META = "Meta"

## Jobs columns
JOBNAME = "JobName"
JOB_TYPE = "JobType"
STATUS = "Status"
PRIORITY = "Priority"
PERCENT = "Percent"
DESCR = "Descr"
SHARED_WORKING_DIR = "SharedWorkingDir"
SUBMIT_USER = "SubmitUser"
SUBMIT_HOST = "SubmitHost"
SUBMIT_TIME = "SubmitTime"
START_TIME = "StartTime"
END_TIME = "EndTime"
LAST_MSG = "LastMsg"
STEPS = "Steps"
CURRENT_STEP = "CurStep"
JOB_VERSION = "Version"
JOB_COMPUTE_VERSION = "ComputeVersion"

## Tasks columns
TASKID = "TaskId"
STEP = "Step"
DEPTH = "Depth"
TYPE = "Type"
MAXNUMRUN = "MaxNumRun"
RETVAL = "RetVal"
NUMRUN = "NumRun"
WORKLOAD = "Workload"
RUN_HOST_NAME = "RunHostName"
RUN_USER_NAME = "RunUserName"
MILESTONE = "Milestone"

## Dependencies columns
DEPENDENCYID = "DependencyID"

## Meta columns
KEY = "Key"
VALUE = "Value"
DB_VERSION_KEY = "Version"

def init_job_queue_db(job_queue_dir: str):
    os.makedirs(job_queue_dir, exist_ok=True)
    if os.path.exists(job_queue_dir + "/JobQueue.db"):
        # We consider it was correctly created
        return
    create_new_jq(job_queue_dir)
    return

def create_new_jq(job_queue_dir: str):
    """Create a brand-new JobQueue.db with the v1.3 schema."""
    db_path = job_queue_dir + "/JobQueue.db"
    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.cursor()

        cursor.execute("PRAGMA foreign_keys=on;")

        # Jobs table
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {JOBS} (
                {JOBNAME} TEXT NOT NULL UNIQUE,
                {STATUS} INT NOT NULL,
                {PRIORITY} INT NOT NULL,
                {PERCENT} REAL NOT NULL,
                {DESCR} TEXT NOT NULL,
                {SHARED_WORKING_DIR} TEXT,
                {JOB_TYPE} TEXT,
                {SUBMIT_USER} TEXT NOT NULL,
                {SUBMIT_HOST} TEXT NOT NULL,
                {SUBMIT_TIME} TEXT NOT NULL,
                {START_TIME} TEXT,
                {END_TIME} TEXT,
                {LAST_MSG} TEXT,
                {STEPS} TEXT,
                {CURRENT_STEP} TEXT,
                {JOB_VERSION} TEXT NOT NULL,
                {JOB_COMPUTE_VERSION} TEXT NOT NULL
            );
        """)

        # Tasks table
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {TASK_TABLE} (
                {JOBNAME} TEXT NOT NULL,
                {TASKID} TEXT NOT NULL UNIQUE,
                {STEP} TEXT,
                {DEPTH} INTEGER,
                {STATUS} INT NOT NULL,
                {TYPE} INT NOT NULL,
                {PERCENT} REAL NOT NULL,
                {MAXNUMRUN} INT NOT NULL,
                {RETVAL} INT,
                {NUMRUN} INT NOT NULL,
                {WORKLOAD} REAL NOT NULL,
                {RUN_HOST_NAME} TEXT,
                {RUN_USER_NAME} TEXT,
                {START_TIME} TEXT,
                {END_TIME} TEXT,
                {LAST_MSG} TEXT,
                {MILESTONE} TEXT
            );
        """)

        # Dependencies table
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {DEPS_TABLE} (
                {JOBNAME} TEXT NOT NULL,
                {TASKID} TEXT NOT NULL,
                {DEPENDENCYID} TEXT
            );
        """)

        # Meta table
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {META} (
                {KEY} TEXT NOT NULL UNIQUE,
                {VALUE} TEXT NOT NULL
            );
        """)

        # Insert current version
        cursor.execute(
            f"INSERT OR IGNORE INTO {META} ({KEY}, {VALUE}) VALUES (?, ?);",
            (DB_VERSION_KEY, DB_CURRENT_VERSION)
        )

        # Indexes
        cursor.execute(f"CREATE INDEX IF NOT EXISTS IdxJobs ON {JOBS} ({JOBNAME} ASC);")
        cursor.execute(f"CREATE INDEX IF NOT EXISTS IdxTasks ON {TASK_TABLE} ({TASKID} ASC, {JOBNAME});")
        cursor.execute(f"CREATE INDEX IF NOT EXISTS IdxJobsOnTasks ON {TASK_TABLE} ({JOBNAME} ASC);")
        cursor.execute(f"CREATE INDEX IF NOT EXISTS IdxTasksJobsOnDeps ON {DEPS_TABLE} ({TASKID}, {JOBNAME});")
        cursor.execute(f"CREATE INDEX IF NOT EXISTS IdxDeps ON {DEPS_TABLE} ({DEPENDENCYID});")

        conn.commit()
    except Exception as e:
        conn.rollback()
        raise RuntimeError(f"Failed to create JobQueue database: {e}") from e
    finally:
        conn.close()

def init_engine_db(job_queue_dir):
    os.makedirs(job_queue_dir, exist_ok=True)
    if os.path.exists(job_queue_dir + "/Engines.db"):
        # We consider it was already correctly created
        return

    db_path = job_queue_dir + "/Engines.db"
    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Engines (
                Edition TEXT NOT NULL,
                Version TEXT NOT NULL,
                Username TEXT NOT NULL,
                Hostname TEXT NOT NULL,
                Status INT NOT NULL,
                StartTime TEXT NOT NULL,
                LastHeartBeat TEXT NOT NULL,
                EndTime TEXT,
                Signal INT NOT NULL
            );
        """)
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise RuntimeError(f"Failed to create Engines database: {e}") from e
    finally:
        conn.close()



class GenericManager:
    def __init__(self, job_queue_dir: str):
        self._job_queue_dir = job_queue_dir
        init_job_queue_db(job_queue_dir)
        init_engine_db(job_queue_dir)

    @staticmethod
    def _acquire_lock(db_path: str, timeout: float) -> int:
        """Acquire a file-based lock (analogous to SemaphoreFile in C++)."""
        lock_path = db_path + ".lock"
        deadline = time.monotonic() + timeout
        while True:
            try:
                fd = os.open(lock_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
                return fd
            except FileExistsError:
                if time.monotonic() >= deadline:
                    raise TimeoutError(f"Could not acquire lock on '{lock_path}' within {timeout}s")
                time.sleep(0.05)

    @staticmethod
    def _release_lock(fd: int, db_path: str):
        """Release the file-based lock."""
        lock_path = db_path + ".lock"
        os.close(fd)
        os.remove(lock_path)

    @staticmethod
    def _format_datetime(dt: datetime) -> str:
        """Format datetime to string in format: YYYYMMDDTHHmmss.ffffff"""
        return dt.strftime("%Y%m%dT%H%M%S.%f")

    @staticmethod
    def _parse_datetime(dt_str: str) -> datetime:
        """Parse datetime from string in format: YYYYMMDDTHHmmss.ffffff"""
        return datetime.strptime(dt_str, "%Y%m%dT%H%M%S.%f")