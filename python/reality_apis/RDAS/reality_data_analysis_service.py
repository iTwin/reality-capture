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
    S2DJobSettings,
    SOrthoJobSettings,
    S3DJobSettings,
    ChangeDetectionJobSettings,
)
from reality_apis.utils import ReturnValue, JobProgress, JobState, JobDateTime, iTwinCaptureError, iTwinCaptureWarning, __version__


class RealityDataAnalysisService:
    """
    Service handling communication with Reality Analysis Service.

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
            "User-Agent": f"Reality Analysis Python SDK/{__version__}",
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
        # take job_settings and create the json settings we need to
        settings_json = settings.to_json()
        jc_dict = {
            "name": job_name,
            "iTwinId": iTwin_id,
            "type": settings.type.value,
            "inputs": settings_json["inputs"],
            "outputs": settings_json["outputs"]
        }
        if "options" in settings_json:
            jc_dict["options"] = settings_json["options"]
        job_json = json.dumps(jc_dict)
        # send the json settings
        response = self._session.post("https://" + self._service_url + "/realitydataanalysis/jobs", job_json,
                                      headers=self._get_header())

        try:
            # if the query was successful we return the id of the job, else we return an empty string and the error message
            data_json = response.json()
            if response.status_code < 200 or response.status_code >= 400:
                return ReturnValue(value="", error=self._error_msg(response.status_code, data_json))
            return ReturnValue(value=data_json["job"]["id"], error="")
        except json.decoder.JSONDecodeError:
            return ReturnValue(value="", error=self._error_msg(response.status_code, {"error": {"message": response.text}}))
        except KeyError as e:
            return ReturnValue(value="", error=str(e))

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
        try:
            data_json = response.json()
            if response.status_code < 200 or response.status_code >= 400:
                return ReturnValue(value=False, error=self._error_msg(response.status_code, data_json))
            return ReturnValue(value=True, error="")
        except json.decoder.JSONDecodeError:
            return ReturnValue(value=False, error=self._error_msg(response.status_code, {"error": {"message": response.text}}))

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

        try:
            data_json = response.json()
            if response.status_code < 200 or response.status_code >= 400:
                return ReturnValue(value=RDAJobProperties(), error=self._error_msg(response.status_code, data_json))

            job_type_str = data_json["job"].get("type", None)
            if job_type_str is None:
                return ReturnValue(value=RDAJobProperties(), error="no Job type")

            if job_type_str == RDAJobType.O2D.value:
                settings = O2DJobSettings.from_json(data_json["job"])
            elif job_type_str == RDAJobType.S2D.value:
                settings = S2DJobSettings.from_json(data_json["job"])
            elif job_type_str == RDAJobType.SOrtho.value:
                settings = SOrthoJobSettings.from_json(data_json["job"])
            elif job_type_str == RDAJobType.S3D.value:
                settings = S3DJobSettings.from_json(data_json["job"])
            elif job_type_str == RDAJobType.ChangeDetection.value:
                settings = ChangeDetectionJobSettings.from_json(data_json["job"])
            else:
                return ReturnValue(
                    value=RDAJobProperties(), error="Job Type not recognized"
                )
            if settings.is_error():
                return ReturnValue(value=RDAJobProperties(), error=settings.error)

            cost_estimation = RDAJobCostParameters()
            estimate = data_json["job"].get("costEstimation", None)
            if estimate is not None:
                cost_estimation_ret = RDAJobCostParameters.from_json(estimate)
                if not cost_estimation_ret.is_error():
                    cost_estimation = cost_estimation_ret.value

            created_date_time = data_json["job"].get("createdDateTime", "")

            errors = []
            warnings = []

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

                exec_errors = execution.get("errors", None)
                if exec_errors is not None:
                    for error in exec_errors:
                        itwin_error = iTwinCaptureError(code=error.get("code", ""), title=error.get("title", ""), message=error.get("message", ""))
                        params = error.get("params", [])
                        itwin_error.params.extend(params)
                        errors.append(itwin_error)

                exec_warnings = execution.get("warnings", None)
                if exec_warnings is not None:
                    for warning in exec_warnings:
                        itwin_warning = iTwinCaptureWarning(code=warning.get("code", ""), title=warning.get("title", ""), message=warning.get("message", ""))
                        params = warning.get("params", [])
                        itwin_warning.params.extend(params)
                        warnings.append(itwin_warning)
            else:
                job_date_time = JobDateTime(created_date_time=created_date_time)
                exit_code = 0
                estimated_units = 0.0

            job_state = JobState(data_json["job"].get("state", JobState.UNKNOWN.value))
            job_name = data_json["job"].get("name", "")
            itwin_id = data_json["job"].get("iTwinId", "")
            data_center = data_json["job"].get("dataCenter", "")
            email = data_json["job"].get("email", "")

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
                    warnings=warnings,
                    errors=errors,
                ),
                error="",
            )
        except json.decoder.JSONDecodeError:
            return ReturnValue(value=RDAJobProperties(), error=self._error_msg(response.status_code, {"error": {"message": response.text}}))

        except (KeyError, ValueError) as e:
            return ReturnValue(value=RDAJobProperties(), error=str(e))

    def get_job_progress(self, job_id: str) -> ReturnValue[JobProgress]:
        """
        Get progress for a given job.

        Args:
            job_id: The ID of the relevant job.
        Returns:
            The progress for the job, and a potential error message.
        """
        response = self._session.get("https://" + self._service_url + f"/realitydataanalysis/jobs/{job_id}/progress", headers=self._get_header())

        try:
            data_json = response.json()
            if response.status_code < 200 or response.status_code >= 400:
                return ReturnValue(value=JobProgress(state=JobState.UNKNOWN, progress=-1, step=""),
                                   error=self._error_msg(response.status_code, data_json))

            dp = data_json["progress"]
            state = JobState(dp["state"].lower())

            return ReturnValue(
                value=JobProgress(
                    state=JobState(state),
                    progress=int(dp["percentage"]),
                    step=dp["step"],
                ),
                error="",
            )
        except json.decoder.JSONDecodeError:
            return ReturnValue(value=JobProgress(state=JobState.UNKNOWN, progress=-1, step=""),
                               error=self._error_msg(response.status_code, {"error": {"message": response.text}}))
        except (KeyError, ValueError) as e:
            return ReturnValue(
                value=JobProgress(state=JobState.UNKNOWN, progress=-1, step=""),
                error=str(e))

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
        jc_dict = {"costEstimationParameters": cost_parameters.to_json()}
        job_json = json.dumps(jc_dict)
        response = self._session.patch("https://" + self._service_url + f"/realitydataanalysis/jobs/{job_id}", job_json, headers=self._get_header())
        try:
            data_json = response.json()
            if response.status_code < 200 or response.status_code >= 400:
                return ReturnValue(value=-1.0, error=self._error_msg(response.status_code, data_json))

            ret = RDAJobCostParameters.from_json(data_json["job"]["costEstimation"])
            return ReturnValue(value=ret.value.estimated_cost, error=ret.error)
        except json.decoder.JSONDecodeError:
            return ReturnValue(value=-1.0, error=self._error_msg(response.status_code, {"error": {"message": response.text}}))
        except KeyError as e:
            return ReturnValue(value=-1.0, error=str(e))

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
        try:
            data_json = response.json()
            if response.status_code < 200 or response.status_code >= 400:
                return ReturnValue(value=False, error=self._error_msg(response.status_code, data_json))
            return ReturnValue(value=True, error="")
        except json.decoder.JSONDecodeError:
            return ReturnValue(value=False, error=self._error_msg(response.status_code, {"error": {"message": response.text}}))

    def delete_job(self, job_id: str) -> ReturnValue[bool]:
        """
        Delete existing job (job cannot already be submitted to be deleted).

        Args:
            job_id: The ID of the job to be deleted.
        Returns:
            True if the job was successfully deleted, and a potential error message.
        """
        response = self._session.delete("https://" + self._service_url + f"/realitydataanalysis/jobs/{job_id}", headers=self._get_header())
        try:
            if response.status_code < 200 or response.status_code >= 400:
                data_json = response.json()
                return ReturnValue(value=False, error=self._error_msg(response.status_code, data_json))
            return ReturnValue(value=True, error="")
        except json.decoder.JSONDecodeError:
            return ReturnValue(value=False, error=self._error_msg(response.status_code, {"error": {"message": response.text}}))
