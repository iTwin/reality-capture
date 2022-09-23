# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

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
    def __init__(self, w_id: str, name: str, project_id: typing.Optional[str]):
        """
        Constructor

        :param w_id: Workspace id
        :param name: Name of the workspace
        :param project_id: Project id to be linked with the workspace
        """
        WorkspaceCreate.__init__(self, name, project_id)
        self._id = w_id

    def id(self) -> str:
        """
        :return: Workspace id
        """
        return self._id

    def __str__(self):
        return f"{self.name()} [{self.id()}] [project id: {self.project_id()}]"
