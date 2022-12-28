# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import requests
import json

from reality_apis.RDAS.rdas_utils import (
    RDAJobCostParameters,
    RDAJobProperties,
)
from reality_apis.RDAS.rdas_enums import RDAJobType
from reality_apis.RDAS.job_settings import (
    JobSettings,
    O2DJobSettings,
    O3DJobSettings,
    S2DJobSettings,
    S3DJobSettings,
    L3DJobSettings,
    ChangeDetectionJobSettings,
)
from reality_apis.utils import ReturnValue, JobProgress, JobState, JobDateTime


class RealityDataAnalysisService:
    """
    Service handling communication with RealityData Analysis Service.

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
            "User-Agent": f"RDAS Python SDK/0.0.1",
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

    def create_job(
            self, settings: JobSettings, job_name: str, iTwin_id: str
    ) -> ReturnValue[str]:
        """
        Creates a job corresponding to the given settings.

        Args:
            settings: Settings for the job.
            job_name: Name of the job.
            iTwin_id: ID of the project.

        Returns:
            The ID of the job, and a potential error message.
        """
        # take job_settings and create the json settings we need to send
        jc_dict = {
            "name": job_name,
            "iTwinId": iTwin_id,
            "type": settings.type.value,
            "settings": settings.to_json(),
        }
        job_json = json.dumps(jc_dict)
        # send the json settings
        response = self._session.post("https://" + self._service_url + "/realitydataanalysis/jobs", job_json,
                                      headers=self._get_header())

        # if the query was successful we return the id of the job, else we return an empty string and the error message
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
        jc_dict = {"state": "active"}
        job_json = json.dumps(jc_dict)
        response = self._session.patch("https://" + self._service_url + f"/realitydataanalysis/jobs/{job_id}",
                                       job_json,
                                       headers=self._get_header())
        data_json = response.json()
        if response.status_code < 200 or response.status_code >= 400:
            return ReturnValue(value=False, error=self._error_msg(response.status_code, data_json))
        return ReturnValue(value=True, error="")

    def get_job_properties(self, job_id: str) -> ReturnValue[RDAJobProperties]:
        """
        Get all properties of a given job.
        By default this function returns a placeholder empty RDAJobProperties if it hasn't succeeded in retrieving job
        settings. Use is_error() to be sure the return value is valid.
        Args:
            job_id: The ID of the relevant job.

        Returns:
            The properties of the job, and a potential error message.
        """

        response = self._session.get("https://" + self._service_url + f"/realitydataanalysis/jobs/{job_id}", headers=self._get_header())
        data_json = response.json()
        if response.status_code < 200 or response.status_code >= 400:
            return ReturnValue(value=RDAJobProperties(), error=self._error_msg(response.status_code, data_json))

        try:
            job_type_str = data_json["job"].get("type", None)
            if job_type_str is None:
                return ReturnValue(value=RDAJobProperties(), error="no Job type")

            if job_type_str == RDAJobType.O2D.value:
                settings = O2DJobSettings.from_json(data_json["job"].get("settings", {}))
            elif job_type_str == RDAJobType.S2D.value:
                settings = S2DJobSettings.from_json(data_json["job"].get("settings", {}))
            elif job_type_str == RDAJobType.O3D.value:
                settings = O3DJobSettings.from_json(data_json["job"].get("settings", {}))
            elif job_type_str == RDAJobType.S3D.value:
                settings = S3DJobSettings.from_json(data_json["job"].get("settings", {}))
            elif job_type_str == RDAJobType.L3D.value:
                settings = L3DJobSettings.from_json(data_json["job"].get("settings", {}))
            elif job_type_str == RDAJobType.ChangeDetection.value:
                settings = ChangeDetectionJobSettings.from_json(
                    data_json["job"].get("settings", {})
                )
            else:
                return ReturnValue(
                    value=RDAJobProperties(), error="Job Type not recognized"
                )
            if settings.is_error():
                return ReturnValue(value=RDAJobProperties(), error=settings.error)

            cost_estimation = RDAJobCostParameters()
            estimate = data_json["job"].get("costEstimation", None)
            if estimate is not None:
                cost_estimation.giga_pixels = float(estimate.get("gigaPixels", 0.0))
                cost_estimation.number_photos = int(estimate.get("numberOfPhotos", 0))
                cost_estimation.scene_width = float(estimate.get("sceneWidth", 0.0))
                cost_estimation.scene_height = float(estimate.get("sceneHeight", 0.0))
                cost_estimation.scene_length = float(estimate.get("sceneLength", 0.0))
                cost_estimation.detector_scale = float(
                    estimate.get("detectorScale", 0.0)
                )
                cost_estimation.detector_cost = float(estimate.get("detectorCost", 0.0))
                cost_estimation.estimated_cost = float(
                    estimate.get("estimatedCost", 0.0)
                )

            created_date_time = data_json["job"].get("createdDateTime", "")
            execution = data_json["job"].get("executionInformation", None)
            if execution is not None:
                job_date_time = JobDateTime(
                    created_date_time=created_date_time,
                    submission_date_time=execution.get("submissionDateTime", ""),
                    started_date_time=execution.get("startedDateTime", ""),
                    ended_date_time=execution.get("endedDateTime", ""),
                )
                exit_code = int(execution.get("exitCode", 0))
                estimated_units = float(execution.get("estimatedUnits", 0.0))
            else:
                job_date_time = JobDateTime(created_date_time=created_date_time)
                exit_code = 0
                estimated_units = 0.0

            job_state = data_json["job"].get("state", JobState.UNKNOWN)
            job_name = data_json["job"].get("name", "")
            itwin_id = data_json["job"].get("projectId", "")
            data_center = data_json["job"].get("dataCenter", "")
            email = data_json["job"].get("dataCenter", "")
        except Exception as e:
            return ReturnValue(value=RDAJobProperties(), error=str(e))

        return ReturnValue(
            value=RDAJobProperties(
                job_type=RDAJobType(job_type_str),
                job_settings=settings.value,
                cost_estimation_parameters=cost_estimation,
                job_date_time=job_date_time,
                job_state=job_state,
                estimated_units=estimated_units,
                exit_code=exit_code,
                job_id=job_id,
                job_name=job_name,
                iTwin_id=itwin_id,
                data_center=data_center,
                email=email,
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
        response = self._session.get("https://" + self._service_url + f"/realitydataanalysis/jobs/{job_id}/progress", headers=self._get_header())
        data_json = response.json()
        if response.status_code < 200 or response.status_code >= 400:
            return ReturnValue(value=JobProgress(state=JobState.UNKNOWN, progress=-1, step=""), error=self._error_msg(response.status_code, data_json))

        dp = data_json["progress"]
        try:
            state = JobState(dp["state"].lower())
        except Exception as e:
            return ReturnValue(
                value=JobProgress(state=JobState.UNKNOWN, progress=-1, step=""),
                error=str(e),
            )
        return ReturnValue(
            value=JobProgress(
                state=JobState(state),
                progress=int(dp["percentage"]),
                step=dp["step"],
            ),
            error="",
        )

    def get_job_estimated_cost(
            self, job_id: str, cost_parameters: RDAJobCostParameters
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
        jc_dict = {"costEstimation": cost_parameters.to_json()}
        job_json = json.dumps(jc_dict)
        response = self._session.patch("https://" + self._service_url + f"/realitydataanalysis/jobs/{job_id}", job_json, headers=self._get_header())
        data_json = response.json()
        if response.status_code < 200 or response.status_code >= 400:
            return ReturnValue(value=-1.0, error=self._error_msg(response.status_code, data_json))

        ret = RDAJobCostParameters.from_json(data_json["job"]["costEstimation"])
        return ReturnValue(value=ret.value.estimated_cost, error=ret.error)

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
        response = self._session.patch("https://" + self._service_url + f"/realitydataanalysis/jobs/{job_id}", job_json, headers=self._get_header())
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
        response = self._session.delete("https://" + self._service_url + f"/realitydataanalysis/jobs/{job_id}", headers=self._get_header())
        if response.status_code < 200 or response.status_code >= 400:
            data_json = response.json()
            return ReturnValue(value=False, error=self._error_msg(response.status_code, data_json))
        return ReturnValue(value=True, error="")
