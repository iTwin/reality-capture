import http.client
import json
import os
import tempfile
import xml.etree.ElementTree as Et

from azure.storage.blob import ContainerClient
from multiprocessing.pool import ThreadPool

import references

from utils import RealityDataType, ReturnValue
from token_factory import token_factory
from apim_utils.code import Code


class ServiceRd:
    """
    Service handling communication with RealityData Analysis Service
    """

    def __init__(self, service_URL: str, project_id, client_id: str) -> None:
        """
        :param service_URL: url of the RealityData Service
        :param project_id: ID of the project where results should be saved
        :param client_id: a client ID with realitydata scopes
        """
        self._token_factory = token_factory.ServiceTokenFactory(client_id, "qa-ims.bentley.com",
                                                                ["realitydata:modify", "realitydata:read",
                                                                 "offline_access"])
        self._connection = http.client.HTTPSConnection(service_URL)
        self.client_id = client_id
        self.project_id = project_id

    def _refresh_connection(self) -> None:
        self._connection.connect()

    def _headers_read(self) -> dict:
        r = {"Authorization": self._token_factory.get_read_token(),
             "User-Agent": f"ContextCapture Python SDK/0.0.1",
             "Content-type": "application/json",
             "Accept": "application/vnd.bentley.itwin-platform.v1+json"}
        return r

    def _headers_modify(self) -> dict:
        r = {"Authorization": self._token_factory.get_modify_token(),
             "User-Agent": f"ContextCapture Python SDK/0.0.1",
             "Content-type": "application/json",
             "Accept": "application/vnd.bentley.itwin-platform.v1+json"}
        return r

    def _create_reality_data(self, name: str, data_type: RealityDataType) -> ReturnValue[str]:
        json_data = json.dumps({
            "projectId": self.project_id,
            "realityData": {"displayName": name, "classification": "Undefined", "type": data_type.value}
        })
        self._connection.request("POST", "/realitydata/", json_data, self._headers_modify())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value="", error=code.error_message())
        data = code.response()
        return ReturnValue(value=data["realityData"]["id"], error="")

    def _update_reality_data(self, rd_id: str, update_dict: dict) -> ReturnValue[bool]:
        json_data = json.dumps({
            "projectId": self.project_id,
            "realityData": update_dict
        })
        self._connection.request("PATCH", f"/realitydata/{rd_id}", json_data, self._headers_modify())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value="", error=code.error_message())
        data = code.response()
        return ReturnValue(value=data["realityData"]["id"], error="")

    @staticmethod
    def _replace_scene_references(scene_path: str, temp_path: str, reference_table: references.ReferenceTable,
                                  local_to_cloud: bool) -> ReturnValue[bool]:
        tree = Et.ElementTree()
        with open(scene_path, 'r') as file:
            tree.parse(file)
            root = tree.getroot()
            if root.tag != "ContextScene":
                return ReturnValue(value=False, error=f"{scene_path} is not a valid ContextScene")
            refs = root.find("References")
            if refs is None:
                return ReturnValue(value=True, error="")
            for reference in refs.findall("Reference"):
                ref_path = reference.find("Path")
                if ref_path is None:
                    return ReturnValue(value=False, error=f"Invalid Reference format in scene {scene_path}")
                if local_to_cloud:
                    ret = reference_table.get_cloud_id_from_local_path(ref_path.text)
                    new_path = "rds:" + ret.value
                else:
                    ret = reference_table.get_local_path_from_cloud_id(ref_path.text[4:])
                    new_path = ret.value
                if ret.is_error():
                    return ret

                ref_path.text = new_path
        tree.write(temp_path)
        return ReturnValue(value=True, error="")

    def init(self) -> ReturnValue[bool]:
        try:
            self._refresh_connection()
        except Exception as e:
            return ReturnValue(value=False, error=str(e))
        return ReturnValue(value=True, error="")

    def upload_reality_data(self, data_path: str, name: str, data_type: RealityDataType) -> ReturnValue[str]:
        """
        Upload reality data to ProjectWise ContextShare

        This function should not be used for a ContextScene that contains dependencies to other data.
        Use upload_context_scene instead

        :param data_path: Local directory containing the relevant data
        :param name: Name of the created entry on ProjectWise ContextShare
        :param data_type: RealityDataType of the data
        :return: The ID of the uploaded data, and a potential error message
        """
        try:
            self._refresh_connection()
        except Exception as e:
            return ReturnValue(value="", error=str(e))
        print("Creating new reality data for project:", self.project_id)
        ret = self._create_reality_data(name, data_type)
        if ret.is_error():
            ReturnValue(value=ret.value, error=ret.error)
        print("Uploading files")
        self._connection.request("GET", f"/realitydata/{ret.value}/container?projectId={self.project_id}&access=Write",
                                 None, self._headers_modify())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            ReturnValue(value="", error=code.error_message())
        sas_uri = code.response()["container"]["_links"]["containerUrl"]["href"]
        files = [os.path.relpath(os.path.join(dp, f), data_path)
                 for dp, dn, filenames in os.walk(data_path) for f in filenames]

        # Notifying we are modifying content
        ret_bool = self._update_reality_data(ret.value, update_dict={"authoring": True})
        if ret_bool.is_error():
            ReturnValue(value="", error=ret.error)

        def _upload_file(filename: str):
            client = ContainerClient.from_container_url(sas_uri)
            with open(os.path.join(data_path, filename), 'rb') as data:
                client.upload_blob(filename, data, timeout=30, max_concurrency=16)

        try:
            with ThreadPool(processes=int(4)) as pool:
                pool.map(_upload_file, files)
        except Exception as e:
            return ReturnValue("", "Failed to upload reality data: " + e)
        # Upload done
        ret_bool = self._update_reality_data(ret.value, update_dict={"authoring": False})
        if ret_bool.is_error():
            ReturnValue(value="", error=ret.error)
        return ret

    def upload_context_scene(self, scene_path: str, name: str, reference_table: references.ReferenceTable) -> \
            ReturnValue[str]:
        """
        Upload a ContextScene to ProjectWise ContextShare

        All dependencies should have been uploaded before, and their IDs provided in the reference table

        :param scene_path: Local directory containing the relevant ContextScene
        :param name: Name of the created entry on ProjectWise ContextShare
        :param reference_table: A table mapping local path of dependencies to their ID
        :return: The ID of the uploaded ContextScene, and a potential error message
        """
        temp_dir = tempfile.TemporaryDirectory()
        temp_filepath = os.path.join(temp_dir.name, 'ContextScene.xml')
        ret = self._replace_scene_references(os.path.join(scene_path, "ContextScene.xml"), temp_filepath,
                                             reference_table, True)
        if ret.is_error():
            return ReturnValue(value="", error=ret.error)
        return self.upload_reality_data(temp_dir.name, name, RealityDataType.ContextScene)

    def download_reality_data(self, data_id: str, output_path: str) -> ReturnValue[bool]:
        """
        Download reality data from ProjectWise ContextShare

        This function should not be used for a ContextScene that contains dependencies to other data.
        Use download_context_scene instead.

        :param data_id: The ID of the data to download
        :param output_path: The path where downloaded data should be saved
        :return: True if download was successful, and a potential error message
        """
        try:
            self._refresh_connection()
        except Exception as e:
            return ReturnValue(value=False, error=str(e))
        self._connection.request("GET", f"/realitydata/{data_id}/container?projectId={self.project_id}&access=Read",
                                 None, self._headers_read())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            ReturnValue(value=False, error=code.error_message())
        sas_uri = code.response()["container"]["_links"]["containerUrl"]["href"]
        client = ContainerClient.from_container_url(sas_uri)
        blobs = client.list_blobs()

        def _download_blob(blob):
            data = client.download_blob(blob, timeout=30, max_concurrency=16).readall()
            download_file_path = os.path.join(output_path, blob.name)
            os.makedirs(os.path.dirname(download_file_path), exist_ok=True)
            with open(download_file_path, "wb") as file:
                file.write(data)

        try:
            with ThreadPool(processes=int(4)) as pool:
                pool.map(_download_blob, blobs)
        except Exception as e:
            ReturnValue(value=False, error="Failed to download reality data:" + e)
        return ReturnValue(value=True, error="")

    def download_context_scene(self, data_id: str, output_path: str, reference_table: references.ReferenceTable) -> \
            ReturnValue[bool]:
        """
        Download a ContextScene from ProjectWise ContextShare

        All dependencies should have been downloaded before, and their IDs provided in the reference table.

        :param data_id: The ID of the ContextScene to download
        :param output_path: The path where downloaded ContextScene should be saved
        :param reference_table: A table mapping local path of dependencies to their ID
        :return: True if download was successful, and a potential error message
        """
        # download
        ret = self.download_reality_data(data_id, output_path)
        if ret.is_error():
            return ret
        # change references
        return self._replace_scene_references(os.path.join(output_path, "ContextScene.xml"),
                                              os.path.join(output_path, "ContextScene.xml"), reference_table, False)
