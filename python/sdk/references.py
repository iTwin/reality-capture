import os
from collections import defaultdict

from sdk.utils import ReturnValue


class ReferenceTable:
    """
    A bi-directional map of local data paths and their corresponding cloud ID.
    """

    def __init__(self) -> None:
        self._cloud_to_local = defaultdict(str)
        self._local_to_cloud = defaultdict(str)

    def save(self, filename: str) -> ReturnValue[bool]:
        """
        Save the table as a text file.

        Args:
            filename: Desired file path.
        Returns:
            True if table was successfully saved, and a potential error message.
        """
        if not os.path.exists(os.path.dirname(filename)):
            try:
                os.makedirs(os.path.dirname(filename))
            except OSError as error:
                error_msg = (
                    "Could not create directory "
                    + os.path.dirname(filename)
                    + ": "
                    + str(error)
                )
                return ReturnValue(value=False, error=error_msg)

        with open(filename, "w", encoding="utf-8") as writer:
            for local, cloud in self._local_to_cloud.items():
                writer.write(local + "," + cloud)
                writer.write("\n")
        return ReturnValue(value=True, error="")

    def load(self, filename: str) -> ReturnValue[bool]:
        """
        Load the table from a text file.

        Args:
            filename: Path to the file to load.
        Returns:
            True if table was successfully loaded, and a potential error message.
        """
        self._cloud_to_local = defaultdict(str)
        self._local_to_cloud = defaultdict(str)
        error_msg = ""
        with open(filename, "r", encoding="utf-8") as reader:
            for line in reader:
                local_path, cloud_id = line.split(",")
                local_path = local_path.strip()
                cloud_id = cloud_id.strip()
                ret = self.add_reference(local_path, cloud_id)
                if len(error_msg) == 0:
                    error_msg = ret.error
        return ReturnValue(value=len(error_msg) == 0, error=error_msg)

    def has_local_path(self, local_path: str) -> bool:
        """
        Check the existence of a local path in the table.

        Args:
            local_path: Relevant local path.
        Returns:
            True if the local path exists in the table.
        """
        return local_path in self._local_to_cloud

    def has_cloud_id(self, cloud_id) -> bool:
        """
        Check the existence of a cloud ID in the table.

        Args:
            cloud_id: Relevant cloud ID.
        Returns:
            True if the cloud ID exists in the table.
        """
        return cloud_id in self._cloud_to_local

    def add_reference(self, local_path: str, cloud_id: str) -> ReturnValue[bool]:
        """
        Add a new entry in the table.

        Args:
            local_path: Local path to add to the table.
            cloud_id: Corresponding cloud ID to add to the table.
        Returns:
            True if the entry was successfully added, and a potential error message.
        """
        local_path = local_path.replace("\\", os.sep).replace("/", os.sep)
        has_local_path = self.has_local_path(local_path)
        has_cloud_id = self.has_cloud_id(cloud_id)
        if has_local_path and has_cloud_id:
            if (
                self._local_to_cloud[local_path] != cloud_id
                or self._cloud_to_local[cloud_id] != local_path
            ):
                error_msg = (
                    "Both "
                    + local_path
                    + " and "
                    + cloud_id
                    + " already exist in table and are not mapped to each other"
                )
                return ReturnValue(value=False, error=error_msg)
            return ReturnValue(value=True, error="")
        else:
            self._local_to_cloud[local_path] = cloud_id
            self._cloud_to_local[cloud_id] = local_path
        return ReturnValue(value=True, error="")

    def _translate_input_path(self, path: str) -> ReturnValue[str]:
        if len(path) == 0:
            return ReturnValue(value="", error="")
        return self.get_cloud_id_from_local_path(path)

    @staticmethod
    def _translate_output_path(path: str) -> str:
        if path:
            return "<requested>"
        return path

    def get_cloud_id_from_local_path(self, local_path: str) -> ReturnValue[str]:
        """
        Find the cloud ID corresponding to a given local path.

        Args:
            local_path: Relevant local path.
        Returns:
            Corresponding cloud ID, and a potential error message.
        """
        if not self.has_local_path(local_path):
            return ReturnValue(
                value="", error="Could not find " + local_path + " in reference table"
            )
        return ReturnValue(value=self._local_to_cloud[local_path], error="")

    def get_local_path_from_cloud_id(self, cloud_id: str) -> ReturnValue[str]:
        """
        Find the local path corresponding to a given cloud ID.

        Args:
            cloud_id: Relevant cloud ID.
        Returns:
            Corresponding local path, and a potential error message.
        """
        if not self.has_cloud_id(cloud_id):
            return ReturnValue(
                value="", error="Could not find " + cloud_id + " in reference table"
            )
        return ReturnValue(value=self._cloud_to_local[cloud_id], error="")
