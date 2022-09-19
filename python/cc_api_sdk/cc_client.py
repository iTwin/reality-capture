# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import http.client
import typing
import json

from cc_api_sdk.utils import *
from cc_api_sdk.workspace import WorkspaceCreate, Workspace
from cc_api_sdk.job import JobCreate, Job, CacheSettings, JobExecutionInformation, JobInput, JobSettings, JobOutput, \
    JobProgress
from cc_api_sdk.enums import JobType, JobState, JobOutcome, AccessStatus, \
    Format, MeshQuality
from apim_utils.code import Code


class ContextCaptureClient:
    """
    Main class for interacting with Context Capture API
    """
    def __init__(self, token_factory, url: str = "api.bentley.com"):
        """
        Constructor

        :param token_factory: Provide token for interacting with the service.
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

    def get_user_access(self, project_id: typing.Optional[str]) -> (Code, typing.Optional[AccessInfo]):
        """
        Get user AccessInformation to the service

        :param project_id: Optional (can be None) project id
        :return: Code with status and possible error details, AccessInfo requested if successful (None otherwise)
        """
        self._connection.request("GET", "/contextcapture/cost/access{}".format(
            "" if project_id is None else "?projectId=" + project_id),
                                 None, self._headers_read())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return code, None

        data = code.response()
        return code, AccessInfo(data["accessInfo"]["processingAllowed"],
                                AccessStatus.from_str(data["accessInfo"]["accessStatus"]))

    def estimate_cost(self, job_id: str, processing_info: ProcessingInformation) -> Code:
        """
        Estimate the cost of a job

        :param job_id: job to patch
        :param processing_info: Processing information of the job
        :return: Code with status and possible error details
        """
        pi_dict = {"gigaPixels": processing_info.giga_pixels(),
                   "megaPoints": processing_info.mega_points(),
                   "inputSizeGB": processing_info.input_size(),
                   "meshQuality": processing_info.quality(),
                   "formats": processing_info.formats(),
                   "jobType": processing_info.job_type()}
        json_data = json.dumps(pi_dict)
        self._connection.request("PATCH", f"/contextcapture/jobs/{job_id}", json_data, self._headers_read())
        response = self._connection.getresponse()

        code = Code(response)

        return code

    def get_engines_limit(self, project_id: typing.Optional[str]) -> (Code, typing.Optional[int]):
        self._connection.request("GET", "/contextcapture/limits/engines{}".format(
            "" if project_id is None else "?projectId=" + project_id),
                                 None, self._headers_read())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return code, None
        data = code.response()
        return code, data["enginesLimit"]["maxEngines"]

    def create_workspace(self, workspace_creation: WorkspaceCreate) -> (Code, typing.Optional[Workspace]):
        """
        Create a new workspace

        :param workspace_creation: Workspace parameters
        :return: Code with status and possible error details, created Workspace if successful (None otherwise)
        """
        wc_dict = {"name": workspace_creation.name()}
        if workspace_creation.project_id() is not None:
            wc_dict["iTwinId"] = workspace_creation.project_id()
        json_data = json.dumps(wc_dict)
        self._connection.request("POST", "/contextcapture/workspaces", json_data, self._headers_modify())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return code, None

        data = code.response()
        return code, Workspace(data["workspace"]["id"], data["workspace"]["name"], data["workspace"]["iTwinId"])

    def get_workspace(self, workspace_id: str) -> (Code, typing.Optional[Workspace]):
        """
        Get workspace information from its id

        :param workspace_id: Workspace id
        :return: Code with status and possible error details, requested Workspace if successful (None otherwise)
        """
        self._connection.request("GET", f"/contextcapture/workspaces/{workspace_id}", None, self._headers_read())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return code, None

        data = code.response()
        return code, Workspace(data["workspace"]["id"], data["workspace"]["name"], data["workspace"]["projectId"])

    def delete_workspace(self, workspace_id: str) -> Code:
        """
        Delete existing workspace

        :param workspace_id: Workspace id
        :return: Code with status and possible error details
        """
        self._connection.request("DELETE", f"/contextcapture/workspaces/{workspace_id}", None, self._headers_modify())
        response = self._connection.getresponse()
        return Code(response)

    @staticmethod
    def _json_to_job(j_dict: dict) -> Job:
        # Handles execution information
        exec_info = None
        if "executionInformation" in j_dict:
            outcome = JobOutcome.from_str(j_dict["executionInformation"]["outcome"]) \
                if "outcome" in j_dict["executionInformation"].keys() else None

            exec_info = JobExecutionInformation(
                j_dict["executionInformation"]["submittedDateTime"],
                j_dict["executionInformation"].get("startDateTime"),
                j_dict["executionInformation"].get("endDateTime"),
                outcome,
                j_dict["executionInformation"].get("units")
            )

        # Handles inputs
        inputs = [JobInput(i["id"], i["description"])
                  for i in j_dict["inputs"]]

        # Handles settings
        # outputs = [JobOutput(i["realityDataId"], Format.from_str(i["format"])) for i in j_dict["jobSettings"]["outputs"]]
        outputs = [JobOutput("", Format.from_str(i["format"])) for i in
                   j_dict["jobSettings"]["outputs"]]
        cache_settings = None
        if "cacheSettings" in j_dict["jobSettings"].keys() and j_dict["jobSettings"]["cacheSettings"] is not None:
            cache_settings = CacheSettings(j_dict["jobSettings"]["cacheSettings"].get("createCache"),
                                           j_dict["jobSettings"]["cacheSettings"].get("useCache"))
        settings = JobSettings(MeshQuality.from_str(j_dict["jobSettings"]["quality"]),
                               j_dict["jobSettings"]["processingEngines"],
                               outputs,
                               cache_settings)

        return Job(j_dict["id"], j_dict["name"], JobType.from_str(j_dict["type"]),
                   JobState.from_str(j_dict["state"]), j_dict["createdDateTime"], j_dict["location"],
                   j_dict["workspaceId"], j_dict["email"], exec_info, inputs, settings)

    def create_job(self, job_create: JobCreate) -> (Code, typing.Optional[Job]):
        """
        Create a new job

        :param job_create: Job Create payload
        :return: Code with status and possible error details, created Job if successful (None otherwise)
        """
        cache_settings = None
        if job_create.settings().cache_settings() is not None:
            cache_settings = {"createCache": job_create.settings().cache_settings().create_cache(),
                              "useCache": job_create.settings().cache_settings().use_cache()}

        jc_dict = {
            "type": job_create.job_type(),
            "name": job_create.job_name(),
            "inputs": [{
                "id": i.reality_data_id(),
                "description": i.description()
            } for i in job_create.inputs()],
            "workspaceId": job_create.workspace_id(),
            "settings": {
                "meshQuality": job_create.settings().quality(),
                "processingEngines": job_create.settings().processing_engines(),
                "outputs": job_create.settings().outputs(),
                "cacheSettings": cache_settings
            }
        }

        job_json = json.dumps(jc_dict)
        self._connection.request("POST", "/contextcapture/jobs", job_json, self._headers_modify())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return code, None

        data = code.response()
        return code, self._json_to_job(data["job"])

    def get_job(self, job_id: str) -> (Code, typing.Optional[Job]):
        """
        Retrieve job information

        :param job_id: Job id
        :return: Code with status and possible error details, requested Job if successful (None otherwise)
        """
        self._connection.request("GET", f"/contextcapture/jobs/{job_id}", None, self._headers_read())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return code, None

        data = code.response()
        return code, self._json_to_job(data["job"])

    def delete_job(self, job_id: str) -> Code:
        """
        Delete existing job (job must be not submitted to be deleted)
        :param job_id: Job id
        :return: Code with status and possible error details
        """
        self._connection.request("DELETE", f"/contextcapture/jobs/{job_id}", None, self._headers_modify())
        response = self._connection.getresponse()
        return Code(response)

    def submit_job(self, job_id: str) -> Code:
        """
        Submit a job

        :param job_id: Job id
        :return: Code with status and possible error details
        """

        jc_dict = {
            "state": "active",
        }
        job_json = json.dumps(jc_dict)
        self._connection.request("PATCH", f"/contextcapture/jobs/{job_id}", job_json, self._headers_modify())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return code, None

        data = code.response()
        return code

    def cancel_job(self, job_id: str) -> Code:
        """
        Cancel a job

        :param job_id: Job id
        :return: Code with status and possible error details
        """

        jc_dict = {
            "state": "cancelled",
        }
        job_json = json.dumps(jc_dict)

        self._connection.request("PATCH", f"/contextcapture/jobs/{job_id}", job_json, self._headers_modify())
        response = self._connection.getresponse()
        return Code(response)

    def get_job_progress(self, job_id: str) -> (Code, typing.Optional[JobProgress]):
        """
        Get a job progress, must be called with backoff intervals of [15, 30, 60, 120] seconds

        :param job_id: Job id
        :return: Code with status and possible error details, requested JobProgress if successful (None otherwise)
        """
        self._connection.request("GET", f"/contextcapture/jobs/{job_id}/progress", None, self._headers_read())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return code, None

        data = code.response()
        return code, JobProgress(data["jobProgress"]["percentage"],
                                 JobState.from_str(data["jobProgress"]["state"]),
                                 data["jobProgress"]["step"])
