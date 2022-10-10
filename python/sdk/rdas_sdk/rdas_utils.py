from enum import Enum
from typing import NamedTuple


class JobStatus(Enum):
    """
    Status of a job
    """
    UNKNOWN = "unknown"
    UNSUBMITTED = "unsubmitted"
    ACTIVE = "active"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"

    Completed = "success"
    Pending = "pending"
    Running = "active"



class JobType(Enum):
    """
    Type of a job
    """
    NONE = "not recognized"
    O2D = "objects2D"
    S2D = "segmentation2D"
    O3D = "objects3D"
    S3D = "segmentation3D"
    ChangeDetection = "changeDetection"
    L3D = "lines3D"


class JobProgress(NamedTuple):
    """
    Progress for the job

    Contains the status for the job, and it's percentage progression as an integer value between 0 and 100
    """
    status: JobStatus
    progress: int
    step: str
