from enum import Enum
from typing import NamedTuple


class JobStatus(Enum):
    """
    Possible status for a job.
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
    Possible types of a job.
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
    Progress of a job.
    Contains the status of the job, it's percentage progression as an integer value between 0 and 100 and a string
    with the name of the step it is at when this exists.
    """

    status: JobStatus
    progress: int
    step: str
