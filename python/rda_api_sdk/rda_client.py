# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import http.client
import typing
import json

from apim_utils.code import Code
from rda_api_sdk.job import JobProgress, Job, JobCreate, JobCostEstimation


class RealityDataAnalysClient:
    """
    Main class for interacting with RDAS API
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
        r = {"Authorization": self._token_factory.get_read_token(),
             "User-Agent": f"RDAS Python SDK/0.0.1",
             "Content-type": "application/json",
             "Accept": "application/vnd.bentley.itwin-platform.v1+json"}
        return r

    def _headers_modify(self):
        return {"Authorization": self._token_factory.get_modify_token(),
                "User-Agent": f"RDAS Python SDK/0.0.1",
                "Content-type": "application/json",
                "Accept": "application/vnd.bentley.itwin-platform.v1+json"}

    def create_job(self, job_create: JobCreate) -> (Code, typing.Optional[Job]):
        """
        Create a new job

        :param job_create: Job Create payload
        :return: Code with status and possible error details, created Job if successful (None otherwise)
        """
        jc_dict = {
            "type": job_create.settings().job_type(),
            "name": job_create.job_name(),
            "iTwinId": job_create.project_id(),
            "settings": job_create.settings().to_jdict()
        }

        job_json = json.dumps(jc_dict)

        print(job_json)

        self._connection.request("POST", "/realitydataanalysis/jobs", job_json, self._headers_modify())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return code, None

        data = code.response()
        return code, Job.from_json(data["job"])

    def get_job(self, job_id: str) -> (Code, typing.Optional[Job]):
        """
        Retrieve job information

        :param job_id: Job id
        :return: Code with status and possible error details, requested Job if successful (None otherwise)
        """
        self._connection.request("GET", f"/realitydataanalysis/jobs/{job_id}", None, self._headers_read())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return code, None

        data = code.response()
        return code, Job.from_json(data["job"])

    def delete_job(self, job_id: str) -> Code:
        """
        Delete existing job (job must be not submitted to be deleted)
        :param job_id: Job id
        :return: Code with status and possible error details
        """
        self._connection.request("DELETE", f"/realitydataanalysis/jobs/{job_id}", None, self._headers_modify())
        response = self._connection.getresponse()
        return Code(response)

    def submit_job(self, job_id: str) -> (Code, typing.Optional[Job]):
        """
        Submit a job

        :param job_id: Job id
        :return: Code with status and possible error details, submitted Job if successful (None otherwise)
        """

        jc_dict = {
            "state": "active",
        }
        job_json = json.dumps(jc_dict)
        self._connection.request("PATCH", f"/realitydataanalysis/jobs/{job_id}", job_json, self._headers_modify())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return code, None

        data = code.response()
        return code, Job.from_json(data["job"])

    def get_job_estimated_cost(self, job_id: str, cost_estimation: JobCostEstimation) -> typing.Optional[float]:
        """
        Estimate job cost

        :param job_id: Job id
        :param cost_estimation: Information relative to the job cost estimation
        :return: float or None
        """

        jc_dict = {
            "costEstimation": cost_estimation.to_jdict()
        }
        job_json = json.dumps(jc_dict)
        self._connection.request("PATCH", f"/realitydataanalysis/jobs/{job_id}", job_json, self._headers_modify())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return None

        data = code.response()

        job = Job.from_json(data["job"])
        if job.cost_estimation() is None:
            return None
        return job.cost_estimation().estimated_cost()

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
        self._connection.request("PATCH", f"/realitydataanalysis/jobs/{job_id}", job_json, self._headers_modify())

        response = self._connection.getresponse()
        return Code(response)

    def get_job_progress(self, job_id: str) -> (Code, typing.Optional[JobProgress]):
        """
        Get a job progress, must be called with backoff intervals of [15, 30, 60, 120] seconds

        :param job_id: Job id
        :return: Code with status and possible error details, requested JobProgress if successful (None otherwise)
        """
        self._connection.request("GET", f"/realitydataanalysis/jobs/{job_id}/progress", None, self._headers_read())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return code, None

        data = code.response()
        dp = data["progress"]
        return code, JobProgress.from_json(dp)
