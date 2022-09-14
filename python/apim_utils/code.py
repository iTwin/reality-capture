# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

from http.client import HTTPResponse
import json


class Code:
    """
    Code for handling success and errors when interacting with ContextCapture API
    """
    def __init__(self, response: HTTPResponse):
        """
        Constructor

        :param response: Response from the service
        """
        self._http_code = response.status
        self._http_reason = response.reason
        content = response.read().decode()
        if content:
            self._data = json.loads(content)
        else:
            self._data = {}

        if "error" in self._data.keys():
            self._error_code = self._data["error"]["code"]
            self._error_message = self._data["error"]["message"]
        else:
            self._error_code = self._data["code"] if "code" in self._data.keys() else self._http_reason
            self._error_message = self._data["message"] if "message" in self._data.keys() else self._http_reason

    def http_code(self) -> int:
        """
        :return: HTTP code returned by the response
        """
        return self._http_code

    def http_reason(self) -> str:
        """
        :return: HTTP reason returned by the response
        """
        return self._http_reason

    def error_code(self) -> str:
        """
        :return: Error code returned by the API
        """
        return self._error_code

    def error_message(self) -> str:
        """
        :return: Error message returned by the API
        """
        return self._error_code

    def success(self) -> bool:
        """
        :return: True if the request was successful
        """
        return 199 < self._http_code < 300

    def response(self) -> dict:
        """
        :return: Response data as dict
        """
        return self._data

    def __str__(self):
        return f"Status {self.http_code()}, reason {self.http_reason()}, " \
               f"error {self.error_code()}, message {self.error_message()}"
