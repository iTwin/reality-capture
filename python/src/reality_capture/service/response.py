from typing import TypeVar, Generic, Optional
from reality_capture.service.error import DetailedErrorResponse


T = TypeVar("T")


class Response(tuple, Generic[T]):
    """
    A tuple containing a Service response.
    """

    status_code: int
    error: Optional[DetailedErrorResponse]
    value: Optional[T]

    def __new__(cls, status_code: int, error: Optional[DetailedErrorResponse], value: Optional[T]):
        self = tuple.__new__(cls, (status_code, error, value))
        self.value = value
        self.status_code = status_code
        self.error = error
        return self

    def get_response_status_code(self) -> int:
        """
        Return the HTTP response status_code

        Returns:
            int. The HTTP response status_code
        """
        return self.status_code

    def is_error(self) -> bool:
        """
        Checks whether the response is an error response.

        Returns:
            True if the response contains a valid error.
        """
        return self.error is not None
