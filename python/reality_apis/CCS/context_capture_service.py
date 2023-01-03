# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import requests
import json

from reality_apis.CCS.ccs_utils import (
    CCWorkspaceProperties,
    CCJobType,
    CCJobQuality,
    CCJobSettings,
    CCJobCostParameters,
    CCJobProperties,
)
from reality_apis.utils import ReturnValue, JobState, JobDateTime, JobProgress


class ContextCaptureService:
    """
    Service handling communication with Context Capture Service.

    Args:
        token_factory: An object that implements the abstract functions in AbstractTokenFactory. Used to retrieve the
        service url and the authorization token used to connect with the service.
    """

    def __init__(self, token_factory) -> None:
        self._token_factory = token_factory
        self._session = requests.Session()
        self._service_url = self._token_factory.get_service_url()

        self._header = {
            "Authorization": None,
            "User-Agent": f"ContextCapture Python SDK/0.0.1",
            "Content-type": "application/json",
            "Accept": "application/vnd.bentley.itwin-platform.v1+json",
        }

    def _get_header(self) -> dict:
        self._header["Authorization"] = self._token_factory.get_token()
        return self._header

    @staticmethod
    def _error_msg(status_code, data_json) -> str:
        error = data_json.get("error", {})
        code = error.get("code", "")
        message = error.get("message", "")
        return f"code {status_code}: {code}, {message}"

    def create_workspace(
        self, work_name: str, iTwin_id: str, cc_version: str = ""
    ) -> ReturnValue[str]:
        """
        Creates a workspace.

        Args:
            work_name: Name for the workspace.
            iTwin_id: ID of the project.
            cc_version: Version of Context Capture to use.

        Returns:
            The ID of the workspace, and a potential error message.
        """
        wc_dict = {"name": work_name, "iTwinId": iTwin_id}
        if cc_version != "":
            wc_dict["contextCaptureVersion"] = cc_version
        json_data = json.dumps(wc_dict)
        response = self._session.post("https://" + self._service_url + "/contextcapture/workspaces", json_data, headers=self._get_header())

        # if the query was successful we return the id of the workspace, else we return an empty string
        data_json = response.json()
        if response.status_code < 200 or response.status_code >= 400:
            return ReturnValue(value="", error=self._error_msg(response.status_code, data_json))
        return ReturnValue(value=data_json["workspace"]["id"], error="")

    def delete_workspace(self, work_id: str) -> ReturnValue[bool]:
        """
        Deletes a workspace.

        Args:
            work_id: id of the workspace.

        Returns:
            True if the workspace was deleted successfully, and a potential error message.
        """
        response = self._session.delete("https://" + self._service_url + f"/contextcapture/workspaces/{work_id}", headers=self._get_header())
        if response.status_code < 200 or response.status_code >= 400:
            data_json = response.json()
            return ReturnValue(value=False, error=self._error_msg(response.status_code, data_json))
        return ReturnValue(value=True, error="")

    def get_workspace_properties(
        self, work_id: str
    ) -> ReturnValue[CCWorkspaceProperties]:
        """
        Get all properties of a given workspace.
        By default this function returns a placeholder empty CCWorkspaceProperties if it hasn't succeeded in retrieving
        workspace properties. Use is_error() to be sure the return value is valid.
        Args:
            work_id: id of the workspace.

        Returns:
            An object with all the workspace properties, and a potential error message.

        """
        response = self._session.get("https://" + self._service_url + f"/contextcapture/workspaces/{work_id}", headers=self._get_header())
        data_json = response.json()
        if response.status_code < 200 or response.status_code >= 400:
            return ReturnValue(value=CCWorkspaceProperties(), error=self._error_msg(response.status_code, data_json))
        return ReturnValue(
            value=CCWorkspaceProperties(
                id=data_json["workspace"]["id"],
                created_date_time=data_json["workspace"]["id"],
                name=data_json["name"]["id"],
                iTwin_id=data_json["iTwinId"]["id"],
                context_capture_version=data_json["contextCaptureVersion"]["id"],
            ),
            error="",
        )

    def create_job(
        self, job_type: CCJobType, settings: CCJobSettings, job_name: str, work_id: str
    ) -> ReturnValue[str]:
        """
        Creates a job corresponding to the given settings.

        Args:
            job_type: Type of the job.
            settings: Settings for the job.
            job_name: Name of the job.
            work_id: ID of the workspace to be used.

        Returns:
            The ID of the job, and a potential error message.
        """
        settings_dict, inputs_dict = settings.to_json()
        jc_dict = {
            "type": job_type.value,
            "name": job_name,
            "inputs": inputs_dict["inputs"],
            "workspaceId": work_id,
            "settings": settings_dict["settings"],
        }
        job_json = json.dumps(jc_dict)
        response = self._session.post("https://" + self._service_url + "/contextcapture/jobs", job_json, headers=self._get_header())
        data_json = response.json()
        if response.status_code < 200 or response.status_code >= 400:
            return ReturnValue(value="", error=self._error_msg(response.status_code, data_json))
        return ReturnValue(value=data_json["job"]["id"], error="")

    def submit_job(self, job_id: str) -> ReturnValue[bool]:
        """
        Submit a job.

        Args:
            job_id: The ID of the job to be submitted.
        Returns:
            True if the job was successfully submitted, and a potential error message.
        """
        jc_dict = {
            "state": "active",
        }
        job_json = json.dumps(jc_dict)
        response = self._session.patch("https://" + self._service_url + f"/contextcapture/jobs/{job_id}", job_json, headers=self._get_header())
        data_json = response.json()
        if response.status_code < 200 or response.status_code >= 400:
            return ReturnValue(value=False, error=self._error_msg(response.status_code, data_json))
        return ReturnValue(value=True, error="")

    def cancel_job(self, job_id: str) -> ReturnValue[bool]:
        """
        Cancel a job.

        Args:
            job_id: The ID of the job to be cancelled.
        Returns:
            True if the job was successfully cancelled, and a potential error message.
        """
        jc_dict = {
            "state": "cancelled",
        }
        job_json = json.dumps(jc_dict)
        response = self._session.patch("https://" + self._service_url + f"/contextcapture/jobs/{job_id}", job_json, headers=self._get_header())
        data_json = response.json()
        if response.status_code < 200 or response.status_code >= 400:
            return ReturnValue(value=False, error=self._error_msg(response.status_code, data_json))
        return ReturnValue(value=True, error="")

    def delete_job(self, job_id: str) -> ReturnValue[bool]:
        """
        Delete existing job (job cannot already be submitted to be deleted).

        Args:
            job_id: The ID of the job to be deleted.
        Returns:
            True if the job was successfully deleted, and a potential error message.
        """
        response = self._session.delete("https://" + self._service_url + f"/contextcapture/jobs/{job_id}", headers=self._get_header())
        if response.status_code < 200 or response.status_code >= 400:
            data_json = response.json()
            return ReturnValue(value=False, error=self._error_msg(response.status_code, data_json))
        return ReturnValue(value=True, error="")

    def get_job_properties(self, job_id: str) -> ReturnValue[CCJobProperties]:
        """
        Get properties for a given job.
        By default this function returns an empty CCJobProperties if it didn't succeeded in retrieving settings.
        Use is_error() to be sure the return value is valid.

        Args:
            job_id: The ID of the relevant job.
        Returns:
            The properties for the job, and a potential error message.
        """
        response = self._session.get("https://" + self._service_url + f"/contextcapture/jobs/{job_id}", headers=self._get_header())
        data_json = response.json()
        if response.status_code < 200 or response.status_code >= 400:
            return ReturnValue(value=CCJobProperties(), error=self._error_msg(response.status_code, data_json))

        try:
            job_name = data_json["job"].get("name", "")
            job_type = CCJobType(data_json["job"].get("type", CCJobType.NONE.value))
            job_state = JobState(data_json["job"].get("state", JobState.UNKNOWN.value))

            cost_estimation_parameters = CCJobCostParameters()
            estimate = data_json["job"].get("costEstimationParameters", None)
            if estimate is not None:
                cost_estimation_parameters.giga_pixels = float(
                    estimate.get("gigaPixels", 0.0)
                )
                cost_estimation_parameters.mega_points = float(
                    estimate.get("megaPoints", 0.0)
                )
                cost_estimation_parameters.mesh_quality = CCJobQuality(
                    estimate.get("meshQuality", CCJobQuality.UNKNOWN.value)
                )
            estimated_cost = float(data_json["job"].get("estimatedCost", 0.0))
            created_date_time = data_json["job"].get("createdDateTime", "")
            execution = data_json["job"].get("executionInformation", None)
            if execution is not None:
                job_date_time = JobDateTime(
                    created_date_time=created_date_time,
                    submission_date_time=execution.get("submittedDateTime", ""),
                    started_date_time=execution.get("startedDateTime", ""),
                    ended_date_time=execution.get("endedDateTime", ""),
                )
                estimated_units = float(execution.get("estimatedUnits", 0.0))
            else:
                job_date_time = JobDateTime(created_date_time=created_date_time)
                estimated_units = 0.0

            iTwin_id = data_json["job"].get("iTwinId", "")
            location = data_json["job"].get("location", "")
            email = data_json["job"].get("email", "")
            work_id = data_json["job"].get("workspaceId", "")

            job_settings = CCJobSettings.from_json(
                data_json["job"].get("jobSettings", []), data_json["job"].get("inputs", [])
            )
            if job_settings.is_error():
                return ReturnValue(value=CCJobProperties(), error=job_settings.error)
        except Exception as e:
            return ReturnValue(value=CCJobProperties(), error=str(e))
        return ReturnValue(
            value=CCJobProperties(
                job_id=job_id,
                job_name=job_name,
                job_type=job_type,
                job_state=job_state,
                job_date_time=job_date_time,
                iTwin_id=iTwin_id,
                location=location,
                email=email,
                work_id=work_id,
                estimated_units=estimated_units,
                job_settings=job_settings.value,
                cost_estimation_parameters=cost_estimation_parameters,
                estimated_cost=estimated_cost,
            ),
            error="",
        )

    def get_job_progress(self, job_id: str) -> ReturnValue[JobProgress]:
        """
        Get progress for a given job.

        Args:
            job_id: The ID of the relevant job.
        Returns:
            The progress for the job, and a potential error message.
        """
        response = self._session.get("https://" + self._service_url + f"/contextcapture/jobs/{job_id}/progress", headers=self._get_header())
        data_json = response.json()
        if response.status_code < 200 or response.status_code >= 400:
            return ReturnValue(value=JobProgress(state=JobState.UNKNOWN, progress=-1, step=""), error=self._error_msg(response.status_code, data_json))

        dp = data_json["jobProgress"]
        try:
            state = JobState(dp["state"].lower())
        except Exception as e:
            return ReturnValue(
                value=JobProgress(state=JobState.UNKNOWN, progress=-1, step=""),
                error=str(e),
            )
        return ReturnValue(
            value=JobProgress(
                state=state, progress=int(dp["percentage"]), step=dp["step"]
            ),
            error="",
        )

    def get_job_estimated_cost(
        self, job_id: str, cost_parameters: CCJobCostParameters
    ) -> ReturnValue[float]:
        """
        Get estimated cost for a given job.

        Args:
            job_id: The ID of the relevant job.
            cost_parameters: New cost estimation parameters for the job.
        Returns:
            The estimated cost of the job, and a potential error
            message.
        """
        pi_dict = {
            "gigaPixels": str(cost_parameters.giga_pixels),
            "megaPoints": str(cost_parameters.mega_points),
            "meshQuality": cost_parameters.mesh_quality.value,
        }
        json_data = json.dumps(pi_dict)
        response = self._session.patch("https://" + self._service_url + f"/contextcapture/jobs/{job_id}", json_data, headers=self._get_header())
        data_json = response.json()
        if response.status_code < 200 or response.status_code >= 400:
            return ReturnValue(value=-1.0, error=self._error_msg(response.status_code, data_json))
        ret = float(data_json["job"].get("estimatedCost", -1.0))
        if ret != -1.0:
            return ReturnValue(value=ret, error="")
        return ReturnValue(value=ret, error="No estimatedCost field in received json")
