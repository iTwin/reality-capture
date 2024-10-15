# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import requests
import json
from reality_apis.utils import ReturnValue, __version__
from enum import Enum


class iTwinClass(Enum):
    """
    The Class of your iTwin.
    """

    ACCOUNT = "Account"
    ENDEAVOR = "Endeavor"
    THING = "Thing"

class iTwinSubClass(Enum):
    """
    The subClass of your iTwin.
    """

    ACCOUNT = "Account"
    ASSET = "Asset"
    PORTFOLIO = "Portfolio"
    PROJECT = "Project"
    PROGRAM = "Program"
    WORKPACKAGE = "WorkPackage"

class iTwinStatus(Enum):
    """
    Possible status for an iTwin.
    """

    ACTIVE = "Active"
    INACTIVE = "Inactive"
    TRIAL = "Trial"

class iTwinSettings:
    """
        Full representation of an iTwin.

        Attributes:
            iTwin_class: The Class of your iTwin.
            iTwin_subclass: The subClass of your iTwin.
            display_name: A display name for the iTwin.
            type: An open ended property to better define your iTwin's Type.
            number: A unique number or code for the iTwin. This is the value that uniquely identifies the iTwin within your organization.
            geographic_location: An optional field specifying the location of the iTwin. This is typically an address or city.
            iana_time_zone: An optional field specifying the time zone of the iTwin. This must be a valid IANA time zone id.
            data_center_location: The data center where the data for this iTwin will be persisted. Default is East US. Valid Values: East US, North Europe, West Europe, Southeast Asia, Australia East, UK South, Canada Central, Central India, Japan East.
            status: Must be one of Active, Inactive or Trial. The default value is Active. By default, Inactive iTwins are not returned from the Get my iTwins API unless requested using the includeInactive parameter.
            parent_id: The Id of the parent of this iTwin. For example, a Project iTwin could be a child of an Asset iTwin.
    """

    def __init__(self) -> None:
        self.iTwin_class = iTwinClass.ENDEAVOR
        self.iTwin_subclass = iTwinSubClass.ASSET
        self.display_name = ""
        self.type = ""
        self.number = ""
        self.geographic_location = ""
        self.iana_time_zone = ""
        self.data_center_location = ""
        self.status = iTwinStatus.ACTIVE
        self.parent_id = ""

    def to_json(self) -> dict:
        """
        Transform iTwin settings into json format.

        Returns:
            iTwin json.
        """
        iTwin_json = {
            "class": self.iTwin_class.value,
            "subClass": self.iTwin_subclass.value,
            "displayName": self.display_name,
            "status": self.status.value
        }
        if self.data_center_location != "":
            iTwin_json["dataCenterLocation"] = self.data_center_location
        if self.type != "":
            iTwin_json["type"] = self.type
        if self.number != "":
            iTwin_json["number"] = self.number
        if self.geographic_location != "":
            iTwin_json["geographicLocation"] = self.geographic_location
        if self.iana_time_zone != "":
            iTwin_json["ianaTimeZone"] = self.iana_time_zone
        if self.parent_id != "":
            iTwin_json["parentId"] = self.parent_id
        return iTwin_json

class iTwinsApiWrapper:
    """
    iTwins API sdk, used to create and manage iTwins.

    Args:
        token_factory: An object that implements the abstract functions in AbstractTokenFactory. Used to retrieve the
        service url and the authorization token used to connect with the service.
    """

    def __init__(self, token_factory) -> None:
        self._token_factory = token_factory
        self._session = requests.Session()
        self._service_url = self._token_factory.get_service_url()

        self._header = {
            "Authorization": None,
            "User-Agent": f"iTwin Python SDK/{__version__}",
            "Content-type": "application/json",
            "Accept": "application/vnd.bentley.itwin-platform.v1+json",
        }

    def _get_header(self) -> dict:
        self._header["Authorization"] = self._token_factory.get_token()
        return self._header

    @staticmethod
    def _error_msg(status_code, data_json) -> str:
        error = data_json.get("error", {})
        code = error.get("code", "")
        message = error.get("message", "")
        return f"code {status_code}: {code}, {message}"

    def create_iTwin(self, itwin_settings) -> ReturnValue[str]:
        """
        Creates an iTwin corresponding to the given parameters.

        Args:
            itwin_settings: iTwin settings, see iTwinSettings class.

        Returns:
            The ID of the created iTwin, and a potential error message.
        """
        settings_json = itwin_settings.to_json()

        request_json = json.dumps(settings_json)
        # send the json settings
        response = self._session.post("https://" + self._service_url + "/itwins/", request_json,
                                      headers=self._get_header())

        try:
            data_json = response.json()
            if response.status_code < 200 or response.status_code >= 400:
                return ReturnValue(value="", error=self._error_msg(response.status_code, data_json))
            return ReturnValue(value=data_json["iTwin"]["id"], error="")
        except json.decoder.JSONDecodeError:
            return ReturnValue(value="", error=self._error_msg(response.status_code, {"error": {"message": response.text}}))
        except KeyError as e:
            return ReturnValue(value="", error=str(e))
