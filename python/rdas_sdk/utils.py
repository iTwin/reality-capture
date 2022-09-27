from enum import Enum
from typing import NamedTuple, TypeVar, Generic


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


class JobType(Enum):
    """
    Type of a job
    """
    NONE = "not recognized"
    O2D = "objects2D"
    S2D = "segmentation2D"
    O3D = "objects3D"
    S3D = "Segmentation3D"
    ChangeDetection = "changeDetection"
    L3D = "lines3D"


T = TypeVar("T")


class ReturnValue(tuple, Generic[T]):
    """
    A tuple containing relevant data, and a potential error message

    When no error was encountered, the error message will be empty
    """
    value: T
    error: str

    def __new__(cls, value: T, error: str):
        self = tuple.__new__(cls, (value, error))
        self.value = value
        self.error = error
        return self

    def is_error(self) -> bool:
        """
        Checks whether this return value contains an error

        :return: True if the return value contains an error
        """
        return len(self.error) > 0


class JobProgress(NamedTuple):
    """
    Progress for the job

    Contains the status for the job, and it's percentage progression as an integer value between 0 and 100
    """
    status: JobStatus
    progress: int
    step: str
