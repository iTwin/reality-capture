import typing
from datetime import datetime
from dateutil import parser


class WorkspaceCreate:
    def __init__(self, name: str, project_id: typing.Optional[str]):
        """
        Model for creating a workspace

        :param name: Name of the workspace
        :param project_id: Project id to be linked with the workspace
        """
        self._name = name
        self._project_id = project_id

    def name(self) -> str:
        """
        Get the name of the workspace to be created

        :return: Name of the workspace to be created
        """
        return self._name

    def project_id(self) -> typing.Optional[str]:
        """
        Get the project id to be linked with the workspace

        :return: Project id
        """
        return self._project_id

    def __str__(self):
        return f"{self.name()} [project id: {self.project_id()}]"


class Workspace(WorkspaceCreate):
    """
    ContextCapture Workspace
    """
    def __init__(self, w_id: str, creation_date_time_str: str, name: str, project_id: typing.Optional[str]):
        """
        Constructor

        :param w_id: Workspace id
        :param creation_date_time_str: Creation date time as a string
        :param name: Name of the workspace
        :param project_id: Project id to be linked with the workspace
        """
        WorkspaceCreate.__init__(self, name, project_id)
        self._id = w_id
        self._creation_date_time = parser.parse(creation_date_time_str)

    def id(self) -> str:
        """
        :return: Workspace id
        """
        return self._id

    def creation_date_time(self) -> datetime:
        """
        :return: Creation date time of the workspace
        """
        return self._creation_date_time

    def __str__(self):
        return f"{self.name()} [{self.id()}] created at {self.creation_date_time()} [project id: {self.project_id()}]"
