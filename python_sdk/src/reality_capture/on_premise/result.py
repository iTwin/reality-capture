from typing import TypeVar, Generic, Optional
from enum import Enum


T = TypeVar("T")


class ManagerErrorCode(Enum):
    JOB_NOT_FOUND = "JobNotFound"
    ENGINE_NOT_FOUND = "EngineNotFound"
    SQLITE_ERROR = "SqliteError"
    CORRUPTED_SPECIFICATIONS = "CorruptedSpecifications"
    MISSING_SPECIFICATIONS = "MissingSpecifications"
    INVALID_JOB_TYPE_IN_DB = "InvalidJobTypeInDB"
    EMPTY_SHARED_WORKING_DIRECTORY = "EmptySharedWorkingDirectory"
    UNSUPPORTED_SPECIFICATIONS = "UnsupportedSpecifications"
    DB_BUSY = "DBBusy"
    JOB_NOT_CANCELLABLE = "JobNotCancellable"
    INVALID_CONTINUATION_TOKEN = "InvalidContinuationToken"


class Result(tuple, Generic[T]):
    """
    A tuple containing a ManagerErrorCode or a value.
    """

    error: Optional[ManagerErrorCode]
    "Optional error if the request failed."
    value: Optional[T]
    "Optional object if the request succeed."

    def __new__(cls, error: Optional[ManagerErrorCode], value: Optional[T]):
        self = tuple.__new__(cls, (error, value))
        self.value = value
        self.error = error
        return self

    def is_error(self) -> bool:
        """
        Checks whether the response is an error response.

        :return: True if the response contains a valid error.
        """
        return self.error is not None

    def get_error_as_str(self) -> str:
        """
        Get the error message.

        :return: The error message.
        """
        match self.error:
            case ManagerErrorCode.JOB_NOT_FOUND:
                return "Job not found."
            case ManagerErrorCode.ENGINE_NOT_FOUND:
                return "Engine not found."
            case ManagerErrorCode.SQLITE_ERROR:
                return "Sqlite error. If the issue persists, raise an issue on the RealityCapture GitHub repository."
            case ManagerErrorCode.CORRUPTED_SPECIFICATIONS:
                return "Corrupted specifications. If the issue persists, raise an issue on the RealityCapture GitHub repository."
            case ManagerErrorCode.MISSING_SPECIFICATIONS:
                return "Missing specifications in database folder."
            case ManagerErrorCode.INVALID_JOB_TYPE_IN_DB:
                return "Invalid job type in the database."
            case ManagerErrorCode.EMPTY_SHARED_WORKING_DIRECTORY:
                return "Empty shared working directory."
            case ManagerErrorCode.UNSUPPORTED_SPECIFICATIONS:
                return "Unsupported specification."
            case ManagerErrorCode.DB_BUSY:
                return "DB is busy, try again later."
            case ManagerErrorCode.JOB_NOT_CANCELLABLE:
                return "Job can't be cancelled due to its current state."
            case ManagerErrorCode.INVALID_CONTINUATION_TOKEN:
                return "Invalid continuation token."
        return ""
