# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.
import requests
import json
import os
import tempfile
from azure.storage.blob import ContainerClient
from multiprocessing.pool import ThreadPool

from sdk.DataTransfer.conversion import (
    replace_context_scene_references,
    replace_ccorientation_references,
)
from sdk.DataTransfer.references import ReferenceTable
from sdk.utils import RealityDataType, ReturnValue


class RealityDataTransfer:
    """
    Utility class that handles communication with the Reality Data API. It implements upload and download of
    different types of RealityData.

    Args:
        token_factory: An object that implements the abstract functions in AbstractTokenFactory. Used to retrieve the
        service url and the authorization token used to connect with the service.
    """

    def __init__(self, token_factory):

        self._token_factory = token_factory
        self._session = requests.Session()
        self._service_url = self._token_factory.get_service_url()

        self._header = {
            "Authorization": None,
            "User-Agent": f"RealityDataTransfer Python SDK/0.0.1",
            "Content-type": "application/json",
            "Accept": "application/vnd.bentley.itwin-platform.v1+json",
        }
        self._progress_hook = None

    def _get_header(self) -> dict:
        self._header["Authorization"] = self._token_factory.get_token()
        return self._header

    @staticmethod
    def _error_msg(status_code, data_json) -> str:
        error = data_json.get("error", {})
        code = error.get("code", "")
        message = error.get("message", "")
        return f"code {status_code}: {code}, {message}"

    def _create_reality_data(
            self,
            name: str,
            data_type: RealityDataType,
            iTwin_id: str = "",
            rootfile: str = "",
    ) -> ReturnValue[str]:
        rd_dict = {
            "realityData": {
                "displayName": name,
                "classification": "Undefined",
                "type": data_type.value,
            }
        }
        if iTwin_id != "":
            rd_dict["projectId"] = iTwin_id
        if rootfile != "":
            rd_dict["realityData"]["rootDocument"] = rootfile
        json_data = json.dumps(rd_dict)

        response = self._session.post("https://" + self._service_url + "/realitydata/", json_data,
                                      headers=self._get_header())
        data_json = response.json()
        if response.status_code < 200 or response.status_code >= 400:
            return ReturnValue(value="", error=self._error_msg(response.status_code, data_json))

        return ReturnValue(value=data_json["realityData"]["id"], error="")

    def _update_reality_data(
            self, rd_id: str, update_dict: dict, iTwin_id: str = ""
    ) -> ReturnValue[str]:
        rd_dict = {"realityData": update_dict}
        if iTwin_id != "":
            rd_dict["projectId"] = iTwin_id
        json_data = json.dumps(rd_dict)

        response = self._session.patch("https://" + self._service_url + f"/realitydata/{rd_id}", json_data,
                                       headers=self._get_header())
        data_json = response.json()
        if response.status_code < 200 or response.status_code >= 400:
            return ReturnValue(value="", error=self._error_msg(response.status_code, data_json))
        return ReturnValue(value=data_json["realityData"]["id"], error="")

    def set_progress_hook(self, hook) -> None:
        """
        Sets a hook function to follow progress of downloads and uploads.

        Args:
            hook: Function to follow progress. It should take a float (progress) as argument and return a boolean. If
                False is returned by this function then the operation will stop.
        """
        self._progress_hook = hook

    def upload_reality_data(
            self,
            data_path: str,
            name: str,
            data_type: RealityDataType,
            iTwin_id: str,
            root_file: str = "",
    ) -> ReturnValue[str]:
        """
        Upload reality data to ProjectWise ContextShare.

        This function should not be used for ContextScenes or CCOrientations that contain dependencies to other data
        unless those dependencies are already uploaded and the file you want to upload points to their id. Use
        upload_context_scene or upload_ccorientation instead.

        Args:
            data_path: Local directory containing the relevant data.
            name: Name of the created entry on ProjectWise ContextShare.
            data_type: RealityDataType of the data.
            iTwin_id: ID of the iTwin project the reality data will be linked to. It is also used to choose the
                data center where the reality data is stored.
            root_file(optional): Used to indicate the root document of the reality data. The root document can be in a
                subfolder and is then specified as “Tile_Root.json” or “Folder1/SubFolder1/File.json” for example, with
                a relative path to the root folder of the data.
        Returns:
            The ID of the uploaded data, and a potential error message.
        """
        print("Creating new reality data for project:", iTwin_id)
        ret = self._create_reality_data(name, data_type, iTwin_id, root_file)
        if ret.is_error():
            return ReturnValue(value=ret.value, error=ret.error)
        print("Uploading files")

        response = self._session.get(
            "https://" + self._service_url + f"/realitydata/{ret.value}/container?projectId={iTwin_id}&access=Write",
            headers=self._get_header())

        data_json = response.json()
        if response.status_code < 200 or response.status_code >= 400:
            return ReturnValue(value="", error=self._error_msg(response.status_code, data_json))

        sas_uri = data_json["container"]["_links"]["containerUrl"]["href"]

        files_tuple = [
            (
                os.path.relpath(os.path.join(dp, f), data_path),
                os.path.getsize(os.path.join(dp, f)),
            )
            for dp, dn, filenames in os.walk(data_path)
            for f in filenames
        ]
        total_size = sum(n for _, n in files_tuple)
        proceed = True
        uploaded_values = {}

        # Notifying we are modifying content
        ret_bool = self._update_reality_data(
            ret.value, update_dict={"authoring": True}, iTwin_id=iTwin_id
        )
        if ret_bool.is_error():
            return ReturnValue(value="", error=ret.error)

        def _upload_file(file_tuple):
            def _upload_callback(current, total):
                nonlocal uploaded_values
                uploaded_values[file_tuple[0]] = current
                percentage = (sum(uploaded_values.values()) / total_size) * 100
                if self._progress_hook is not None:
                    nonlocal proceed
                    proceed = proceed and self._progress_hook(percentage)
                if not proceed:
                    raise InterruptedError("Upload interrupted by callback function")

            client = ContainerClient.from_container_url(sas_uri)
            with open(os.path.join(data_path, file_tuple[0]), "rb") as data:
                client.upload_blob(
                    file_tuple[0],
                    data,
                    connection_timeout=60,
                    max_concurrency=16,
                    retry_total=20,
                    retry_connect=10,
                    progress_hook=_upload_callback,
                )
            nonlocal uploaded_values
            uploaded_values[file_tuple[0]] = file_tuple[1]

        try:
            with ThreadPool(processes=int(4)) as pool:
                pool.map(_upload_file, files_tuple)
        except InterruptedError as e:
            return ReturnValue("", "Stopped upload of reality data: " + str(e))
        except Exception as e:
            return ReturnValue("", "Failed to upload reality data: " + str(e))
        finally:
            ret_bool = self._update_reality_data(
                ret.value, update_dict={"authoring": False}, iTwin_id=iTwin_id
            )
            if ret_bool.is_error():
                return ReturnValue(value="", error=ret.error)
        return ret

    def upload_context_scene(
            self,
            scene_path: str,
            name: str,
            iTwin_id: str,
            reference_table: ReferenceTable = None,
    ) -> ReturnValue[str]:
        """
        Upload a ContextScene to ProjectWise ContextShare.
        Convenience function that replaces references if a reference table is provided and upload the ContextScene.
        All local dependencies should have been uploaded before, and their IDs provided in the reference table.

        Args:
            scene_path: Local directory containing the relevant ContextScene. The file must be called "ContextScene".
            name: Name of the created entry on ProjectWise ContextShare.
            iTwin_id: ID of the iTwin project the reality data will be linked to. It is also used to choose the
                data center where the reality data is stored.
            reference_table (optional): A table mapping local path of dependencies to their ID.
        Returns:
            The ID of the uploaded ContextScene, and a potential error message.
        """
        if reference_table is not None:
            temp_dir = tempfile.TemporaryDirectory()
            if os.path.isfile(os.path.join(scene_path, "ContextScene.xml")):
                temp_filepath = os.path.join(temp_dir.name, "ContextScene.xml")
                filepath = os.path.join(scene_path, "ContextScene.xml")
            else:
                temp_filepath = os.path.join(temp_dir.name, "ContextScene.json")
                filepath = os.path.join(scene_path, "ContextScene.json")

            ret = replace_context_scene_references(
                filepath, temp_filepath, reference_table, True
            )
            if ret.is_error():
                return ReturnValue(value="", error=ret.error)
            return self.upload_reality_data(
                temp_dir.name, name, RealityDataType.ContextScene, iTwin_id
            )
        return self.upload_reality_data(
            scene_path, name, RealityDataType.ContextScene, iTwin_id
        )

    def upload_ccorientation(
            self,
            ccorientation_path: str,
            name: str,
            iTwin_id: str,
            reference_table: ReferenceTable = None,
    ) -> ReturnValue[str]:
        """
        Upload a CCOrientation to ProjectWise ContextShare.
        Convenience function that replaces references if a reference table is provided and upload the file.
        All local dependencies should have been uploaded before, and their IDs provided in the reference table.

        Args:
            ccorientation_path: Local directory containing the relevant CCOrientation. The file must be called
            "Orientations".
            name: Name of the created entry on ProjectWise ContextShare.
            iTwin_id: ID of the iTwin project the reality data will be linked to. It is also used to choose the
                data center where the reality data is stored.
            reference_table (optional): A table mapping local path of dependencies to their ID.
        Returns:
            The ID of the uploaded CCOrientation, and a potential error message.
        """
        if reference_table is not None:
            temp_dir = tempfile.TemporaryDirectory()
            temp_filepath = os.path.join(temp_dir.name, "Orientations.xml")
            ret = replace_ccorientation_references(
                os.path.join(ccorientation_path, "Orientations.xml"),
                temp_filepath,
                reference_table,
                True,
            )
            if ret.is_error():
                return ReturnValue(value="", error=ret.error)
            return self.upload_reality_data(
                temp_dir.name, name, RealityDataType.CCOrientations, iTwin_id
            )
        return self.upload_reality_data(
            ccorientation_path, name, RealityDataType.CCOrientations, iTwin_id
        )

    def download_reality_data(
            self, data_id: str, output_path: str, iTwin_id: str) -> ReturnValue[bool]:
        """
        Download reality data from ProjectWise ContextShare.
        This function should not be used for ContextScenes that contain dependencies to data you have locally as the
        paths will point to ids in the ProjectWise ContextShare.
        Use download_context_scene instead.

        Args:
            data_id: The ID of the data to download.
            output_path: The path where downloaded data should be saved.
            iTwin_id: ID of the iTwin project the reality data will be linked to. It is also used to choose the
                data center where the reality data is stored.
        Returns:
            True if download was successful, and a potential error message.
        """
        response = self._session.get(
            "https://" + self._service_url + f"/realitydata/{data_id}/container?projectId={iTwin_id}&access=Read",
            headers=self._get_header())

        data_json = response.json()
        if response.status_code < 200 or response.status_code >= 400:
            return ReturnValue(value="", error=self._error_msg(response.status_code, data_json))
        sas_uri = data_json["container"]["_links"]["containerUrl"]["href"]

        client = ContainerClient.from_container_url(sas_uri)
        blobs = client.list_blobs()

        blobs_tuple = [(blob.name, blob.size) for blob in blobs]
        total_size = sum(n for _, n in blobs_tuple)
        proceed = True
        downloaded_values = {}

        def _download_blob(blob_tuple):
            def _download_callback(current, total):
                nonlocal downloaded_values
                downloaded_values[blob_tuple[0]] = current
                percentage = (sum(downloaded_values.values()) / total_size) * 100
                if self._progress_hook is not None:
                    nonlocal proceed
                    proceed = proceed and self._progress_hook(percentage)
                if not proceed:
                    raise InterruptedError("Download interrupted by callback function")

            data = client.download_blob(
                blob_tuple[0],
                connection_timeout=60,
                max_concurrency=16,
                retry_total=20,
                retry_connect=10,
                progress_hook=_download_callback,
            ).readall()

            download_file_path = os.path.join(output_path, blob_tuple[0])
            os.makedirs(os.path.dirname(download_file_path), exist_ok=True)

            with open(download_file_path, "wb") as file:
                file.write(data)
            nonlocal downloaded_values
            downloaded_values[blob_tuple[0]] = blob_tuple[1]

        try:
            with ThreadPool(processes=int(4)) as pool:
                pool.map(_download_blob, blobs_tuple)
        except InterruptedError as e:
            return ReturnValue("", "Stopped download of reality data: " + str(e))
        except Exception as e:
            return ReturnValue("", "Failed to upload reality data: " + str(e))

        return ReturnValue(value=True, error="")

    def download_context_scene(
            self, data_id: str, output_path: str, iTwin_id: str, reference_table: ReferenceTable = None
    ) -> ReturnValue[bool]:
        """
        Download a ContextScene from ProjectWise ContextShare.
        Convenience function that downloads the ContextScene and replaces references if a reference table is provided.
        All dependencies should have been downloaded before or already be local, and their IDs on the cloud and local
        paths should be provided in the reference table.

        Args:
            data_id: The ID of the ContextScene to download.
            output_path: The path where downloaded ContextScene should be saved.
            iTwin_id: ID of the iTwin project the reality data will be linked to. It is also used to choose the
                data center where the reality data is stored.
            reference_table (optional): A table mapping local path of dependencies to their ID.
        Returns:
            True if download was successful, and a potential error message.
        """
        # download
        ret = self.download_reality_data(data_id, output_path, iTwin_id)
        if ret.is_error():
            return ret
        if reference_table is not None:
            # change references
            return replace_context_scene_references(
                os.path.join(output_path, "ContextScene.xml"),
                os.path.join(output_path, "ContextScene.xml"),
                reference_table,
                False,
            )
        return ret

    def download_ccorientation(
            self, data_id: str, output_path: str, iTwin_id: str, reference_table: ReferenceTable = None
    ) -> ReturnValue[bool]:
        """
        Download a CCOrientation from ProjectWise ContextShare.
        Convenience function that downloads the CCOrientation and replaces references if a reference table is provided.
        All dependencies should have been downloaded before or already be local, and their IDs on the cloud and local
        paths should be provided in the reference table.

        Args:
            data_id: The ID of the CCOrientation to download.
            output_path: The path where downloaded file should be saved.
            iTwin_id: ID of the iTwin project the reality data will be linked to. It is also used to choose the
                data center where the reality data is stored.
            reference_table (optional): A table mapping local path of dependencies to their ID.
        Returns:
            True if download was successful, and a potential error message.
        """
        # download
        ret = self.download_reality_data(data_id, output_path, iTwin_id)
        if ret.is_error():
            return ret
        if reference_table is not None:
            # change references
            return replace_ccorientation_references(
                os.path.join(output_path, "Orientations.xml"),
                os.path.join(output_path, "Orientations.xml"),
                reference_table,
                False,
            )
        return ret


def example_hook(percentage):
    """
    Example of a hook function to be used by the RealityDataTransfer object.

    Args:
        percentage: Percentage of download or upload already done.

    Returns:
        True
    """
    print("percentage: {:.2%}".format(percentage / 100), flush=True)
    return True
