# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import datetime
import http.client
import json
import os
from multiprocessing.pool import ThreadPool
from typing import Optional, List

from azure.storage.blob import ContainerClient
from dateutil import parser

from apim_utils.code import Code
from rd_api_sdk.reality_data import RealityData, RealityDataCreate, RealityDataUpdate, Extent, Coordinate, \
    Classification, Acquisition


class RealityDataClient:
    """
    Main class for interacting with Reality Data API
    """
    def __init__(self, token_factory, url: str = "api.bentley.com"):
        """
        Constructor

        :param token_factory: Provides a token for interacting with the service.
                              Must implement get_read_token() and get_modify_token()
        :param url: Target url for the api
        """
        self._token_factory = token_factory
        self._connection = http.client.HTTPSConnection(url)

    def _headers_read(self):
        return {"Authorization": self._token_factory.get_read_token(),
                "User-Agent": f"ContextCapture Python SDK/0.0.1",
                "Content-type": "application/json",
                "Accept": "application/vnd.bentley.itwin-platform.v1+json"}

    def _headers_modify(self):
        return {"Authorization": self._token_factory.get_modify_token(),
                "User-Agent": f"ContextCapture Python SDK/0.0.1",
                "Content-type": "application/json",
                "Accept": "application/vnd.bentley.itwin-platform.v1+json"}

    @staticmethod
    def _datetime_to_iso_8601_str(dt: datetime) -> str:
        return dt.astimezone(tz=datetime.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")

    @staticmethod
    def _rd_as_dict(rd: RealityDataUpdate) -> dict:
        d = {}
        if rd.name() is not None:
            d["displayName"] = rd.name()
        if rd.classification() is not None:
            d["classification"] = rd.classification()
        if rd.type() is not None:
            d["type"] = rd.type()
        if rd.description() is not None:
            d["description"] = rd.description()
        if rd.dataset() is not None:
            d["dataset"] = rd.dataset()
        if rd.group() is not None:
            d["group"] = rd.group()
        if rd.root_document() is not None:
            d["rootDocument"] = rd.root_document()
        a = rd.acquisition()
        if a is not None:
            if a.start_date() is not None:
                d["acquisition"]["startDateTime"] = RealityDataClient._datetime_to_iso_8601_str(a.start_date())
            if a.end_date() is not None:
                d["acquisition"]["endDateTime"] = RealityDataClient._datetime_to_iso_8601_str(a.end_date())
            if a.acquirer() is not None:
                d["acquisition"]["acquirer"] = a.acquirer()
        if rd.extent() is not None:
            d["extent"] = {
                "southwest": {
                    "latitude": rd.extent().southwest().lat(),
                    "longitude": rd.extent().southwest().long()
                },
                "northeast": {
                    "latitude": rd.extent().northeast().lat(),
                    "longitude": rd.extent().northeast().long()
                }
            }
        if rd.authoring() is not None:
            d["authoring"] = rd.authoring()
        return d

    @staticmethod
    def _rd_from_dict(d: dict) -> RealityData:
        classification = Classification.from_str(d['classification'])
        if d.get("extent"):
            extent = Extent(Coordinate(d["extent"]["southwest"]["latitude"], d["extent"]["southwest"]["longitude"]),
                            Coordinate(d["extent"]["northeast"]["latitude"], d["extent"]["northeast"]["longitude"]))
        else:
            extent = None
        if d.get("acquisition"):
            acquisition = Acquisition(parser.parse(d["acquisition"]["startDateTime"])
                                      if "startDateTime" in d["acquisition"].keys() else None,
                                      parser.parse(d["acquisition"]["endDateTime"])
                                      if "endDateTime" in d["acquisition"].keys() else None,
                                      d["acquisition"].get("acquirer"))
        else:
            acquisition = None

        return RealityData(d["id"],
                           d["displayName"],
                           classification,
                           d["type"],
                           d["modifiedDateTime"],
                           d["lastAccessedDateTime"],
                           d["createdDateTime"],
                           d["dataCenterLocation"],
                           acquisition,
                           d.get("description"),
                           d.get("dataset"),
                           d.get("group"),
                           d.get("rootDocument"),
                           extent,
                           d.get("authoring"))

    def create_reality_data(self, rd_create: RealityDataCreate, project_id: str) -> (Code, Optional[RealityData]):
        """
        Create a new reality data

        :param rd_create: Base information for the reality data
        :param project_id: Project Id
        :return: Code with status and possible error details, created RealityData if successful (None otherwise)
        """
        json_data = json.dumps({
            "projectId": project_id,
            "realityData": self._rd_as_dict(rd_create)
        })
        self._connection.request("POST", "/realitydata/", json_data, self._headers_modify())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return code, None

        data = code.response()
        return code, self._rd_from_dict(data["realityData"])

    def get_reality_data(self, rd_id) -> (Code, Optional[RealityData]):
        """
        Retrieve reality data details

        :param rd_id: Reality data id
        :return: Code with status and possible error details, retrieved RealityData if successful (None otherwise)
        """
        self._connection.request("GET", f"/realitydata/{rd_id}", None, self._headers_read())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return code, None

        data = code.response()
        return code, self._rd_from_dict(data["realityData"])

    def update_reality_data(self, rd_id: str, project_id: str, rd_update: RealityDataUpdate) -> (Code, RealityData):
        """
        Update reality data details

        :param rd_id: Reality data id to update
        :param project_id: Project id
        :param rd_update: Update information
        :return: Code with status and possible error details, updated RealityData if successful (None otherwise)
        """

        json_data = json.dumps({
            "projectId": project_id,
            "realityData": self._rd_as_dict(rd_update)
        })

        self._connection.request("PATCH", f"/realitydata/{rd_id}", json_data, self._headers_modify())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return code, None

        data = code.response()

        return code, self._rd_from_dict(data["realityData"])

    def delete_reality_data(self, rd_id: str) -> Code:
        """
        Delete existing reality data

        :param rd_id: Reality data id to delete
        :return: Code with status and possible error details
        """
        self._connection.request("DELETE", f"/realitydata/{rd_id}", None, self._headers_modify())
        response = self._connection.getresponse()
        return Code(response)

    def associate_project(self, rd_id: str, project_id: str) -> Code:
        """
        Associate a project to a reality data

        :param rd_id: Reality data id
        :param project_id: Project id
        :return: Code with status and possible error details
        """
        self._connection.request("PUT", f"/realitydata/{rd_id}/projects/{project_id}", None, self._headers_modify())
        response = self._connection.getresponse()
        return Code(response)

    def dissociate_project(self, rd_id: str, project_id: str) -> Code:
        """
        Dissociate a project from a reality data

        :param rd_id: Reality data id
        :param project_id: Project id
        :return: Code with status and possible error details
        """
        self._connection.request("DELETE", f"/realitydata/{rd_id}/projects/{project_id}", None, self._headers_modify())
        response = self._connection.getresponse()
        return Code(response)

    def upload_files(self, rd_id: str, project_id: str, folder: str, ignore_files: Optional[List[str]] = None) -> Code:
        """
        Upload files

        :param rd_id: Reality data id
        :param project_id: Project id
        :param folder: Folder to be uploaded
        :param ignore_files: Files to be ignored
        :return: Code with status and possible error details
        """
        if ignore_files is None:
            ignore_files = []

        self._connection.request("GET", f"/realitydata/{rd_id}/container?projectId={project_id}&access=Write",
                                 None, self._headers_modify())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return code
        sas_uri = code.response()["container"]["_links"]["containerUrl"]["href"]
        files = [os.path.relpath(os.path.join(dp, f), folder)
                 for dp, dn, filenames in os.walk(folder) for f in filenames if os.path.join(dp, f) not in ignore_files]
        self.update_reality_data(rd_id, project_id, RealityDataUpdate(authoring=True))  # Notifying we are modifying content

        def _upload_file(filename: str):
            client = ContainerClient.from_container_url(sas_uri)
            with open(os.path.join(folder, filename), 'rb') as data:
                client.upload_blob(filename, data, timeout=30, max_concurrency=16)
        try:
            with ThreadPool(processes=int(4)) as pool:
                pool.map(_upload_file, files)
        except Exception as e:
            print("Failed to upload reality data:", e)

        self.update_reality_data(rd_id, project_id, RealityDataUpdate(authoring=False))  # Upload done
        return code

    def download_files(self, rd_id: str, project_id: str, destination_folder: str) -> Code:
        """
        Download files

        :param rd_id: Reality data id
        :param project_id: Project id
        :param destination_folder: Where to download files
        :return: Code with status and possible error details
        """
        self._connection.request("GET", f"/realitydata/{rd_id}/container?projectId={project_id}&access=Read",
                                 None, self._headers_read())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return code
        sas_uri = code.response()["container"]["_links"]["containerUrl"]["href"]
        client = ContainerClient.from_container_url(sas_uri)
        blobs = client.list_blobs()

        def _download_blob(blob):
            data = client.download_blob(blob, timeout=30, max_concurrency=16).readall()
            download_file_path = os.path.join(destination_folder, blob.name)
            os.makedirs(os.path.dirname(download_file_path), exist_ok=True)
            with open(download_file_path, "wb") as file:
                file.write(data)
        try:
            with ThreadPool(processes=int(4)) as pool:
                pool.map(_download_blob, blobs)
        except Exception as e:
            print("Failed to download reality data:", e)
        return code
