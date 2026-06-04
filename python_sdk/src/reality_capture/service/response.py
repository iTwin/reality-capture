from typing import TypeVar, Generic, Optional
from dataclasses import dataclass
from reality_capture.service.error import DetailedErrorResponse


T = TypeVar("T")

@dataclass
class Response(Generic[T]):
    """
    A tuple containing a Service response.
    """

    status_code: int
    "HTTP Status Code returned by the service."
    error: Optional[DetailedErrorResponse]
    "Optional error if the request failed."
    value: Optional[T]
    "Optional object if the request succeed."

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
