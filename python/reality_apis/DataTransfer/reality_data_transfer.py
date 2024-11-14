# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.
import shutil
from typing import List, Tuple

import requests
import json
import os
import tempfile
from azure.storage.blob import ContainerClient
from multiprocessing.pool import ThreadPool

from reality_apis.DataTransfer.conversion import (
    replace_context_scene_references,
    replace_ccorientation_references,
)
from reality_apis.DataTransfer.references import ReferenceTable
from reality_apis.utils import RealityDataType, ReturnValue, __version__


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
            "User-Agent": f"Reality Data Transfer Python SDK/{__version__}",
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

    @staticmethod
    def _create_files_tuple(data_path, data_types, recursion) -> List[Tuple[str, int]]:
        # get relative paths to files and their sizes, we can choose types if data_path is a directory and also if we
        # want to recursively go through subdirectories or not.
        if os.path.isdir(data_path) and recursion:
            if data_types is not None:
                files_tuple = [
                    (
                        os.path.relpath(os.path.join(dp, f), data_path),
                        os.path.getsize(os.path.join(dp, f)),
                    )
                    for dp, dn, filenames in os.walk(data_path)
                    for f in filenames
                    if os.path.splitext(f)[1] in data_types
                ]
            else:
                files_tuple = [
                    (
                        os.path.relpath(os.path.join(dp, f), data_path),
                        os.path.getsize(os.path.join(dp, f)),
                    )
                    for dp, dn, filenames in os.walk(data_path)
                    for f in filenames
                ]
        elif os.path.isdir(data_path):
            if data_types is not None:
                files_tuple = [(f, os.path.getsize(os.path.join(data_path, f)))
                               for f in os.listdir(data_path)
                               if os.path.isfile(os.path.join(data_path, f)) and os.path.splitext(f)[1] in data_types]
            else:
                files_tuple = [(f, os.path.getsize(os.path.join(data_path, f)))
                               for f in os.listdir(data_path)
                               if os.path.isfile(os.path.join(data_path, f))]
        else:
            files_tuple = [(os.path.basename(data_path), os.path.getsize(data_path))]
        return files_tuple

    def _create_reality_data(
            self,
            name: str,
            data_type: RealityDataType,
            iTwin_id: str = "",
            rootfile: str = "",
    ) -> ReturnValue[str]:
        rd_dict = {
            "displayName": name,
            "type": data_type.value,
        }
        if iTwin_id != "":
            rd_dict["iTwinId"] = iTwin_id
        if rootfile != "":
            rd_dict["rootDocument"] = rootfile
        json_data = json.dumps(rd_dict)

        response = self._session.post("https://" + self._service_url + "/reality-management/reality-data/", json_data,
                                      headers=self._get_header())
        try:
            data_json = response.json()
            if response.status_code < 200 or response.status_code >= 400:
                return ReturnValue(value="", error=self._error_msg(response.status_code, data_json))
            return ReturnValue(value=data_json["realityData"]["id"], error="")
        except json.decoder.JSONDecodeError:
            return ReturnValue(value="", error=self._error_msg(response.status_code, {"error": {"message": response.text}}))
        except KeyError as e:
            return ReturnValue(value="", error=str(e))

    def _update_reality_data(
            self, rd_id: str, update_dict: dict, iTwin_id: str = ""
    ) -> ReturnValue[str]:
        rd_dict = update_dict
        if iTwin_id != "":
            rd_dict["iTwinId"] = iTwin_id
        json_data = json.dumps(rd_dict)

        response = self._session.patch("https://" + self._service_url + f"/reality-management/reality-data/{rd_id}", json_data,
                                       headers=self._get_header())
        try:
            data_json = response.json()
            if response.status_code < 200 or response.status_code >= 400:
                return ReturnValue(value="", error=self._error_msg(response.status_code, data_json))
            return ReturnValue(value=data_json["realityData"]["id"], error="")
        except json.decoder.JSONDecodeError:
            return ReturnValue(value="", error=self._error_msg(response.status_code, {"error": {"message": response.text}}))
        except KeyError as e:
            return ReturnValue(value="", error=str(e))

    def _upload_data_to_container(self, data_path, rd_id, iTwin_id, rd_folder ="", data_types = None, recursion = True) -> ReturnValue[bool]:
        # get files relative paths and sizes
        files_tuple = self._create_files_tuple(data_path, data_types, recursion)

        size_threshold = 5 * 1024 * 1024  # 5mb
        nb_small_files = sum(size <= size_threshold for _, size in files_tuple)

        nb_threads = min(32, 4 + nb_small_files // 100)  # control number of threads considering quantity of files

        total_size = sum(size for _, size in files_tuple)
        proceed = True
        uploaded_values = {}

        # ask for the rd container
        response = self._session.get(
            "https://" + self._service_url + f"/reality-management/reality-data/{rd_id}/writeaccess?iTwinId={iTwin_id}",
            headers=self._get_header())
        try:
            data_json = response.json()
            if response.status_code < 200 or response.status_code >= 400:
                return ReturnValue(value=False, error=self._error_msg(response.status_code, data_json))
            sas_uri = data_json["_links"]["containerUrl"]["href"]
        except json.decoder.JSONDecodeError:
            return ReturnValue(value=False, error=self._error_msg(response.status_code, {"error": {"message": response.text}}))
        except KeyError as e:
            return ReturnValue(value=False, error=str(e))

        # Notify we are modifying content
        ret_bool = self._update_reality_data(
            rd_id, update_dict={"authoring": True}, iTwin_id=iTwin_id
        )
        if ret_bool.is_error():
            return ReturnValue(value=False, error=ret_bool.error)

        def _upload_file(file_tuple):
            def _upload_callback(current, total):
                nonlocal uploaded_values
                uploaded_values[file_tuple[0]] = current
                percentage = (sum(uploaded_values.values()) / total_size) * 100
                nonlocal proceed
                if self._progress_hook is not None:
                    proceed = proceed and self._progress_hook(percentage)
                if not proceed:
                    raise InterruptedError("Upload interrupted by callback function")

            client = ContainerClient.from_container_url(sas_uri)
            file_path = os.path.join(data_path, file_tuple[0]) if os.path.isdir(data_path) else data_path
            with open(file_path, "rb") as data:
                client.upload_blob(
                    rd_folder + file_tuple[0],
                    data,
                    connection_timeout=60,
                    max_concurrency=16,
                    retry_total=20,
                    retry_connect=10,
                    progress_hook=_upload_callback,
                    overwrite=True,
                )
            nonlocal uploaded_values
            uploaded_values[file_tuple[0]] = file_tuple[1]

        try:
            with ThreadPool(processes=nb_threads) as pool:
                pool.map(_upload_file, files_tuple)
        except InterruptedError as e:
            return ReturnValue(False, "Stopped upload of reality data: " + str(e))
        finally:
            ret_bool = self._update_reality_data(rd_id, update_dict={"authoring": False}, iTwin_id=iTwin_id)
            if ret_bool.is_error():
                return ReturnValue(value=False, error=ret_bool.error)
        return ReturnValue(value=True, error="")

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

        This function will upload all files *and subdirectories* if the path given in argument points to a directory.

        Args:
            data_path: Local directory containing the relevant data or path to one specific file.
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
        print("reality data created")
        rd_id = ret.value

        print("Uploading files")
        ret_up = self._upload_data_to_container(data_path, rd_id, iTwin_id)
        if ret_up.is_error():
            return ReturnValue(value=rd_id, error=ret_up.error)
        return ReturnValue(value=rd_id, error="")

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
        temp_dir = tempfile.TemporaryDirectory()
        if os.path.isfile(os.path.join(scene_path, "ContextScene.xml")):
            filepath = os.path.join(scene_path, "ContextScene.xml")
            temp_filepath = os.path.join(temp_dir.name, "ContextScene.xml")
        elif os.path.isfile(os.path.join(scene_path, "ContextScene.json")):
            filepath = os.path.join(scene_path, "ContextScene.json")
            temp_filepath = os.path.join(temp_dir.name, "ContextScene.json")
        else:
            return ReturnValue(value="", error=f"Could not find any ContextScene file at {scene_path}")
        if reference_table is not None:
            ret = replace_context_scene_references(
                filepath, temp_filepath, reference_table, True
            )
            if ret.is_error():
                return ReturnValue(value="", error=ret.error)
        else:
            shutil.copy(filepath, temp_filepath)

        return self.upload_reality_data(
            temp_dir.name, name, RealityDataType.ContextScene, iTwin_id
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
        Convenience function that replaces references if a reference table is provided and upload files.
        All local dependencies should have been uploaded before, and their IDs provided in the reference table.
        If a tie points file is present at the path location, it will also be uploaded.

        Args:
            ccorientation_path: Local directory containing the relevant CCOrientation. The file must be called
            "Orientations.xml". Tie points files must be called "Orientations - TiePoints.xml".
            name: Name of the created entry on ProjectWise ContextShare.
            iTwin_id: ID of the iTwin project the reality data will be linked to. It is also used to choose the
                data center where the reality data is stored.
            reference_table (optional): A table mapping local path of dependencies to their ID.
        Returns:
            The ID of the uploaded CCOrientation, and a potential error message.
        """
        temp_dir = tempfile.TemporaryDirectory()
        if not os.path.isfile(os.path.join(ccorientation_path, "Orientations.xml")):
            return ReturnValue(value="", error=f"Could not find any Orientations file at {ccorientation_path}")

        temp_filepath = os.path.join(temp_dir.name, "Orientations.xml")
        if reference_table is not None:
            ret = replace_ccorientation_references(
                os.path.join(ccorientation_path, "Orientations.xml"),
                temp_filepath,
                reference_table,
                True,
            )
            if ret.is_error():
                return ReturnValue(value="", error=ret.error)
        else:
            shutil.copy(os.path.join(ccorientation_path, "Orientations.xml"), temp_filepath)

        if os.path.exists(os.path.join(ccorientation_path, "Orientations - TiePoints.xml")):
            shutil.copy(os.path.join(ccorientation_path, "Orientations - TiePoints.xml"), temp_dir.name)

        return self.upload_reality_data(
            temp_dir.name, name, RealityDataType.CCOrientations, iTwin_id
        )

    def upload_json_to_workspace(self, data_path: str, iTwin_id: str, work_id: str, job_id: str) -> ReturnValue[bool]:
        """
        Upload .json files to an already existent workspace.
        Convenience function to upload specific settings to ContextCapture Service jobs. Files are uploaded to the
        workspace passed in argument in the folder job_id/data/ so that the service can find the files when the job is
        submitted.

        This function will upload *all* json files present at the path given in argument but not recursively (it won't
        upload json files in subdirectories).

        Args:
            data_path: Local directory containing .json files
            iTwin_id: ID of the iTwin project the workspace is linked to.
            work_id: ID of the workspace the job is linked to.
            job_id: The ID of the job the files are to be linked to.

        Returns:
            True if upload was successful, and a potential error message.
        """
        # Upload data to a workspace
        data_types = {".json"}
        rd_folder = f"{job_id}/data/"

        return self._upload_data_to_container(data_path, work_id, iTwin_id, rd_folder=rd_folder, data_types=data_types, recursion=False)

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
            "https://" + self._service_url + f"/reality-management/reality-data/{data_id}/readaccess?iTwinId={iTwin_id}",
            headers=self._get_header())

        try:
            data_json = response.json()
            if response.status_code < 200 or response.status_code >= 400:
                return ReturnValue(value="", error=self._error_msg(response.status_code, data_json))
            sas_uri = data_json["_links"]["containerUrl"]["href"]
        except json.decoder.JSONDecodeError:
            return ReturnValue(value=False, error=self._error_msg(response.status_code, {"error": {"message": response.text}}))
        except KeyError as e:
            return ReturnValue(value=False, error=str(e))

        client = ContainerClient.from_container_url(sas_uri)
        blobs = client.list_blobs()

        blobs_tuple = [(blob.name, blob.size) for blob in blobs]

        size_threshold = 5 * 1024 * 1024  # 5mb
        nb_small_files = sum(size <= size_threshold for _, size in blobs_tuple)

        nb_threads = min(32, 4 + nb_small_files // 100)  # control number of threads considering quantity of files

        total_size = sum(n for _, n in blobs_tuple)
        proceed = True
        downloaded_values = {}

        def _download_blob(blob_tuple):
            def _download_callback(current, total):
                nonlocal downloaded_values
                downloaded_values[blob_tuple[0]] = current
                percentage = (sum(downloaded_values.values()) / total_size) * 100
                nonlocal proceed
                if self._progress_hook is not None:
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
            with ThreadPool(processes=nb_threads) as pool:
                pool.map(_download_blob, blobs_tuple)
        except InterruptedError as e:
            return ReturnValue("", "Stopped download of reality data: " + str(e))
        except Exception as e:
            return ReturnValue("", "Failed to download reality data: " + str(e))

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
            if os.path.exists(os.path.join(output_path, "ContextScene.xml")):
                return replace_context_scene_references(
                    os.path.join(output_path, "ContextScene.xml"),
                    os.path.join(output_path, "ContextScene.xml"),
                    reference_table,
                    False,
                )
            else:
                return replace_context_scene_references(
                    os.path.join(output_path, "ContextScene.json"),
                    os.path.join(output_path, "ContextScene.json"),
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

    def delete_reality_data(self, rd_id: str) -> ReturnValue[bool]:
        """
        Deletes a reality data from ProjectWise ContextShare.
        To delete a reality data, it must be associated to only one (or zero) project.
        If it has more associated projects, first dissociate the projects.

        Args:
            rd_id: The ID of the reality data to delete.

        Returns:
            True if download was successful, and a potential error message.
        """
        response = self._session.delete(
            "https://" + self._service_url + f"/reality-management/reality-data/{rd_id}",
            headers=self._get_header())

        try:
            if response.status_code < 200 or response.status_code >= 400:
                data_json = response.json()
                return ReturnValue(value=False, error=self._error_msg(response.status_code, data_json))
            return ReturnValue(value=True, error="")
        except json.decoder.JSONDecodeError:
            return ReturnValue(value=False, error=self._error_msg(response.status_code, {"error": {"message": response.text}}))


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
