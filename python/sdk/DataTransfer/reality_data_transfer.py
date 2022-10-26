import http.client
import json
import os
import tempfile
from azure.storage.blob import ContainerClient
from multiprocessing.pool import ThreadPool

from token_factory import token_factory
from apim_utils.code import Code
from sdk.DataTransfer.conversion import replace_context_scene_references, replace_ccorientation_references
from sdk.DataTransfer.references import ReferenceTable
from sdk.utils import RealityDataType, ReturnValue


class RealityDataTransfer:
    """
    Handles communication with RealityData Analysis Service.

    Args:
        service_URL: url of the RealityData Service.
        client_id: a client ID with at least realitydata scopes.
    """

    def __init__(self, service_URL: str, client_id: str) -> None:
        # must change urls to prod ones!
        self._token_factory = token_factory.ServiceTokenFactory(
            client_id,
            "qa-ims.bentley.com",
            ["realitydata:modify", "realitydata:read", "offline_access"],
        )
        self._connection = http.client.HTTPSConnection(service_URL)

    def _headers_read(self) -> dict:
        r = {
            "Authorization": self._token_factory.get_read_token(),
            "User-Agent": f"ContextCapture Python SDK/0.0.1",
            "Content-type": "application/json",
            "Accept": "application/vnd.bentley.itwin-platform.v1+json",
        }
        return r

    def _headers_modify(self) -> dict:
        r = {
            "Authorization": self._token_factory.get_modify_token(),
            "User-Agent": f"ContextCapture Python SDK/0.0.1",
            "Content-type": "application/json",
            "Accept": "application/vnd.bentley.itwin-platform.v1+json",
        }
        return r

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
        self._connection.request(
            "POST", "/realitydata/", json_data, self._headers_modify()
        )
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value="", error=code.error_message())
        data = code.response()
        return ReturnValue(value=data["realityData"]["id"], error="")

    def _update_reality_data(
        self, rd_id: str, update_dict: dict, iTwin_id: str = ""
    ) -> ReturnValue[bool]:
        rd_dict = {"realityData": update_dict}
        if iTwin_id != "":
            rd_dict["projectId"] = iTwin_id
        json_data = json.dumps(rd_dict)
        self._connection.request(
            "PATCH", f"/realitydata/{rd_id}", json_data, self._headers_modify()
        )
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value="", error=code.error_message())
        data = code.response()
        return ReturnValue(value=data["realityData"]["id"], error="")

    def connect(self) -> ReturnValue[bool]:
        """
        Connects to the Reality data service.

        Returns:
            True if connected to the service, and a potential error message.
        """
        try:
            self._connection.connect()
        except Exception as e:
            return ReturnValue(value=False, error=str(e))
        return ReturnValue(value=True, error="")

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
        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value="", error=ret.error)
        print("Creating new reality data for project:", iTwin_id)
        ret = self._create_reality_data(name, data_type, iTwin_id, root_file)
        if ret.is_error():
            ReturnValue(value=ret.value, error=ret.error)
        print("Uploading files")
        self._connection.request(
            "GET",
            f"/realitydata/{ret.value}/container?projectId={iTwin_id}&access=Write",
            None,
            self._headers_modify(),
        )
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            ReturnValue(value="", error=code.error_message())
        sas_uri = code.response()["container"]["_links"]["containerUrl"]["href"]
        files = [
            os.path.relpath(os.path.join(dp, f), data_path)
            for dp, dn, filenames in os.walk(data_path)
            for f in filenames
        ]
        # Notifying we are modifying content
        ret_bool = self._update_reality_data(
            ret.value, update_dict={"authoring": True}, iTwin_id=iTwin_id
        )
        if ret_bool.is_error():
            ReturnValue(value="", error=ret.error)

        def _upload_file(filename: str):
            client = ContainerClient.from_container_url(sas_uri)
            with open(os.path.join(data_path, filename), "rb") as data:
                client.upload_blob(filename, data, timeout=30, max_concurrency=16)

        try:
            with ThreadPool(processes=int(4)) as pool:
                pool.map(_upload_file, files)
        except Exception as e:
            return ReturnValue("", "Failed to upload reality data: " + str(e))
        # Upload done
        ret_bool = self._update_reality_data(
            ret.value, update_dict={"authoring": False}, iTwin_id=iTwin_id
        )
        if ret_bool.is_error():
            ReturnValue(value="", error=ret.error)
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
        self, data_id: str, output_path: str
    ) -> ReturnValue[bool]:
        """
        Download reality data from ProjectWise ContextShare.
        This function should not be used for ContextScenes that contain dependencies to data you have locally as the
        paths will point to ids in the ProjectWise ContextShare.
        Use download_context_scene instead.

        Args:
            data_id: The ID of the data to download.
            output_path: The path where downloaded data should be saved.
        Returns:
            True if download was successful, and a potential error message.
        """
        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value=False, error=ret.error)

        self._connection.request(
            "GET",
            f"/realitydata/{data_id}/container?&access=Read",
            None,
            self._headers_read(),
        )
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=False, error=code.error_message())
        sas_uri = code.response()["container"]["_links"]["containerUrl"]["href"]
        client = ContainerClient.from_container_url(sas_uri)
        blobs = client.list_blobs()

        def _download_blob(blob):
            data = client.download_blob(
                blob, timeout=30, max_concurrency=16, retry_connect=10
            ).readall()
            download_file_path = os.path.join(output_path, blob.name)
            os.makedirs(os.path.dirname(download_file_path), exist_ok=True)
            with open(download_file_path, "wb") as file:
                file.write(data)

        try:
            ret = self.connect()
            if ret.is_error():
                return ReturnValue(
                    value=False, error="Failed to download reality data:" + ret.error
                )
            with ThreadPool(processes=int(4)) as pool:
                pool.map(_download_blob, blobs)
        except Exception as e:
            ReturnValue(value=False, error="Failed to download reality data:" + str(e))
        return ReturnValue(value=True, error="")

    def download_context_scene(
        self, data_id: str, output_path: str, reference_table: ReferenceTable = None
    ) -> ReturnValue[bool]:
        """
        Download a ContextScene from ProjectWise ContextShare.
        Convenience function that downloads the ContextScene and replaces references if a reference table is provided.
        All dependencies should have been downloaded before or already be local, and their IDs on the cloud and local
        paths should be provided in the reference table.

        Args:
            data_id: The ID of the ContextScene to download.
            output_path: The path where downloaded ContextScene should be saved.
            reference_table (optional): A table mapping local path of dependencies to their ID.
        Returns:
            True if download was successful, and a potential error message.
        """
        # download
        ret = self.download_reality_data(data_id, output_path)
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
        self, data_id: str, output_path: str, reference_table: ReferenceTable = None
    ) -> ReturnValue[bool]:
        """
        Download a CCOrientation from ProjectWise ContextShare.
        Convenience function that downloads the CCOrientation and replaces references if a reference table is provided.
        All dependencies should have been downloaded before or already be local, and their IDs on the cloud and local
        paths should be provided in the reference table.

        Args:
            data_id: The ID of the CCOrientation to download.
            output_path: The path where downloaded file should be saved.
            reference_table (optional): A table mapping local path of dependencies to their ID.
        Returns:
            True if download was successful, and a potential error message.
        """
        # download
        ret = self.download_reality_data(data_id, output_path)
        if ret.is_error():
            return ret
        if reference_table is not None:
            # change references
            return replace_ccorientation_references(
                os.path.join(output_path, "Orientation.xml"),
                os.path.join(output_path, "Orientation.xml"),
                reference_table,
                False,
            )
        return ret
