from typing import TypeVar, Generic, Optional
from enum import Enum


T = TypeVar("T")


class JobDetailsError(Enum):
    JOB_NOT_FOUND = "JobNotFound"
    ENGINE_NOT_FOUND = "EngineNotFound"
    SQLITE_ERROR = "SqliteError"
    CORRUPTED_SPECIFICATIONS = "CorruptedSpecifications"
    INVALID_JOB_TYPE_IN_DB = "InvalidJobTypeInDB"
    EMPTY_SHARED_WORKING_DIRECTORY = "EmptySharedWorkingDirectory"
    UNSUPPORTED_SPECIFICATIONS = "UnsupportedSpecifications"


class Result(tuple, Generic[T]):
    """
    A tuple containing a Engine response.
    """

    error: Optional[JobDetailsError]
    "Optional error if the request failed."
    value: Optional[T]
    "Optional object if the request succeed."

    def __new__(cls, error: Optional[JobDetailsError], value: Optional[T]):
        self = tuple.__new__(cls, (error, value))
        self.value = value
        self.error = error
        return self

    def is_error(self) -> bool:
        """
        Checks whether the response is an error response.

        Returns:
            True if the response contains a valid error.
        """
        return self.error is not None

    def get_error_as_str(self) -> str:
        """
        Get the error message.

        Returns:
            The error as a string.
        """
        if not self.is_error():
            return ""
        match self.error:
            case JobDetailsError.NONE:
                return ""
            case JobDetailsError.JOB_NOT_FOUND:
                return "Job not found in database"
            case JobDetailsError.EMPTY_JOB_NAME:
                return "Job name is empty"
            case JobDetailsError.DB_BUSY:
                return "Database is busy, please try again"
            case JobDetailsError.CANT_FIND_POSITION_IN_QUEUE:
                return "Can't find the job position in the queue"
            case JobDetailsError.CANT_GET_WORKER_HOST_NAMES:
                return "Can't retrieve worker hostnames from database"
            case JobDetailsError.DB_NOT_INITIALIZED:
                return "Database is not initialized, please relaunch jobqueue monitor"
            case JobDetailsError.INVALID_PROGRESS:
                return "Invalid progress value in database"
            case JobDetailsError.INVALID_PROPERTY:
                return "Invalid priority in database"
            case JobDetailsError.MISSING_INFORMATION:
                return "Missing information in database"
