from enum import Enum


class JobType(str, Enum):
    OBJECTS2D = "objects2D"
    SEGMENTATION2D = "segmentation2D"
    
    @staticmethod
    def from_str(s: str):
        for x in JobType:
            if s == x.value:
                return x


class JobState(str, Enum):
    UNSUBMITTED = "unsubmitted"
    ACTIVE = "active"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"

    @staticmethod
    def from_str(s: str):
        for x in JobState:
            if s == x.value:
                return x
