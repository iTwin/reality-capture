# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

from enum import Enum
from typing import TypeVar, Generic, NamedTuple, List

from importlib import metadata

try:
    __version__ = metadata.version(__package__)
except metadata.PackageNotFoundError as e:
    __version__ = "github clone"


class RealityDataType(Enum):
    """
    Data types used in ProjectWise ContextShare.
    """

    CCImageCollection = "CCImageCollection"
    ContextScene = "ContextScene"
    ContextDetector = "ContextDetector"
    CCOrientations = "CCOrientations"
    ScanCollection = "ScanCollection"
    DGN = "DGN"
    SHP = "SHP"
    POD = "POD"
    LAS = "LAS"
    LAZ = "LAZ"
    OPC = "OPC"
    PLY = "PLY"
    ThreeMX = "3MX"
    ThreeSM = "3SM"
    Cesium = "Cesium3DTiles"
    E57 = "E57"
    GeoJSON = "GeoJSON"
    OVT = "OVT"
    OVF = "OVF"
    PointCloud = "PointCloud"
    Unstructured = "Unstructured"
    PNTS = "PNTS"


class JobState(Enum):
    """
    Possible state for a job.
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

    # ccs
    Over = "over"


class _iTwinCaptureErrorWarning(NamedTuple):
    code: str = ""
    title: str = ""
    message: str = ""
    params: List[str] = []


class iTwinCaptureError(_iTwinCaptureErrorWarning):
    """
    Describe iTwin Capture job error.
    """
    pass


class iTwinCaptureWarning(_iTwinCaptureErrorWarning):
    """
    Describe an iTwin Capture job warning.
    """
    pass


class JobDateTime(NamedTuple):
    """
    Date details of a job.
    """

    created_date_time: str = ""
    submission_date_time: str = ""
    started_date_time: str = ""
    ended_date_time: str = ""


class JobProgress(NamedTuple):
    """
    Progress of a job.
    Contains the state of the job, it's percentage progression as an integer value between 0 and 100 and a string
    with the name of the step it is at when this exists.
    """

    state: JobState = JobState.UNKNOWN
    progress: int = -1
    step: str = ""


T = TypeVar("T")


class ReturnValue(tuple, Generic[T]):
    """
    A tuple containing relevant data, and a potential error message.
    When no error was encountered, the error message will be empty.
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
        Checks whether this return value contains an error.

        Returns:
            True if the return value contains an error
        """
        return len(self.error) > 0
