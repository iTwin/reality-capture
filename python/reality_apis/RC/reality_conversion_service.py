# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import requests
import json

from reality_apis.RC.rcs_utils import RCJobProperties, RCJobType
from reality_apis.RC.rcs_settings import ConversionSettings, ImportFeaturesSettings
from reality_apis.RC.rcs_utils import RCJobCostParameters
from reality_apis.utils import ReturnValue, __version__, JobState, JobDateTime, JobProgress


class RealityConversionService:
    """
    Service handling communication with Reality Conversion Service.

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
            "User-Agent": f"RCS Python SDK/{__version__}",
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

    def create_job(self, settings, job_name, iTwin_id) -> ReturnValue[str]:
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
        settings_dict = settings.to_json()
        jc_dict = {
            "type": settings_dict["type"],
            "name": job_name,
            "iTwinId": iTwin_id,
            "inputs": settings_dict["inputs"],
            "outputs": settings_dict["outputs"],
            "options": settings_dict["options"]
        }
        job_json = json.dumps(jc_dict)
        # send the json settings
        response = self._session.post("https://" + self._service_url + "/realityconversion/jobs", job_json,
                                      headers=self._get_header())

        # if the query was successful we return the id of the job, else we return an empty string and the error message*
        try:
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
        response = self._session.patch("https://" + self._service_url + f"/realityconversion/jobs/{job_id}",
                                       job_json,
                                       headers=self._get_header())
        try:
            data_json = response.json()
            if response.status_code < 200 or response.status_code >= 400:
                return ReturnValue(value=False, error=self._error_msg(response.status_code, data_json))
            return ReturnValue(value=True, error="")
        except json.decoder.JSONDecodeError:
            return ReturnValue(value=False, error=self._error_msg(response.status_code, {"error": {"message": response.text}}))

    def get_job_properties(self, job_id: str) -> ReturnValue[RCJobProperties]:
        """
        Get all properties of a given job.
        By default, this function returns a placeholder empty RCJobProperties if it hasn't succeeded in retrieving job
        settings. Use is_error() to be sure the return value is valid.

        Args:
            job_id: The ID of the relevant job.

        Returns:
            The properties of the job, and a potential error message.
        """
        response = self._session.get("https://" + self._service_url + f"/realityconversion/jobs/{job_id}",
                                     headers=self._get_header())
        try:
            data_json = response.json()
            if response.status_code < 200 or response.status_code >= 400:
                return ReturnValue(value=RCJobProperties(), error=self._error_msg(response.status_code, data_json))

            job_name = data_json["job"].get("name", "")
            job_type = RCJobType(data_json["job"].get("type", RCJobType.NONE.value))
            job_state = JobState(data_json["job"].get("state", JobState.UNKNOWN.value))

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

            itwin_id = data_json["job"].get("iTwinId", "")
            data_center = data_json["job"].get("dataCenter", "")
            email = data_json["job"].get("email", "")

            job_type_str = data_json["job"].get("type", None)
            if job_type_str is None:
                return ReturnValue(value=RCJobProperties(), error="no Job type")
            if job_type_str == RCJobType.CONVERSION.value:
                job_settings = ConversionSettings.from_json(data_json["job"])
            elif job_type_str == RCJobType.IMPORT_FEATURES.value:
                job_settings = ImportFeaturesSettings.from_json(data_json["job"])
            else:
                return ReturnValue(
                    value=RCJobProperties(), error="Job Type not recognized"
                )
            if job_settings.is_error():
                return ReturnValue(value=RCJobProperties(), error=job_settings.error)

            cost_estimation = RCJobCostParameters()
            estimate = data_json["job"].get("costEstimation", None)
            if estimate is not None:
                cost_estimation.giga_pixels = float(estimate.get("gigaPixels", 0.0))
                cost_estimation.mega_points = float(estimate.get("megaPoints", 0.0))
                cost_estimation.estimated_cost = float(estimate.get("estimatedCost", 0.0))

            return ReturnValue(
                value=RCJobProperties(job_id=job_id,
                                      job_name=job_name,
                                      job_type=job_type,
                                      job_state=job_state,
                                      job_date_time=job_date_time,
                                      estimated_units=estimated_units,
                                      data_center=data_center,
                                      iTwin_id=itwin_id,
                                      email=email,
                                      job_settings=job_settings.value,
                                      cost_estimation_parameters=cost_estimation),
                error="")

        except json.decoder.JSONDecodeError:
            return ReturnValue(value=RCJobProperties(), error=self._error_msg(response.status_code, {"error": {"message": response.text}}))

        except (KeyError, ValueError) as e:
            return ReturnValue(value=RCJobProperties(), error=str(e))

    def get_job_progress(self, job_id: str) -> ReturnValue[JobProgress]:
        """
        Get progress for a given job.

        Args:
            job_id: The ID of the relevant job.

        Returns:
            The progress for the job, and a potential error message.
        """
        response = self._session.get("https://" + self._service_url + f"/realityconversion/jobs/{job_id}/progress",
                                     headers=self._get_header())
        try:
            data_json = response.json()
            if response.status_code < 200 or response.status_code >= 400:
                return ReturnValue(value=JobProgress(state=JobState.UNKNOWN, progress=-1, step=""), error=self._error_msg(response.status_code, data_json))
            dp = data_json["progress"]
            state = JobState(dp["state"].lower())
            return ReturnValue(value=JobProgress(state=state, progress=int(dp["percentage"]), step=dp["step"]), error="")

        except json.decoder.JSONDecodeError:
            return ReturnValue(value=JobProgress(state=JobState.UNKNOWN, progress=-1, step=""), error=self._error_msg(response.status_code, {"error": {"message": response.text}}))
        except (KeyError, ValueError) as e:
            return ReturnValue(value=JobProgress(state=JobState.UNKNOWN, progress=-1, step=""), error=str(e))

    def get_job_estimated_cost(self, job_id: str, cost_parameters: RCJobCostParameters) -> ReturnValue[float]:
        """
        Get estimated cost for a given job.

        Args:
            job_id: The ID of the relevant job.
            cost_parameters: New cost estimation parameters for the job.

        Returns:
            The estimated cost of the job, and a potential error
            message.
        """
        pi_dict = {"costEstimationParameters": cost_parameters.to_json()}
        json_data = json.dumps(pi_dict)
        response = self._session.patch("https://" + self._service_url + f"/realityconversion/jobs/{job_id}", json_data,
                                       headers=self._get_header())
        try:
            data_json = response.json()
            if response.status_code < 200 or response.status_code >= 400:
                return ReturnValue(value=-1.0, error=self._error_msg(response.status_code, data_json))
            ret = RCJobCostParameters.from_json(data_json["job"]["costEstimation"])
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
        response = self._session.patch("https://" + self._service_url + f"/realityconversion/jobs/{job_id}", job_json,
                                       headers=self._get_header())
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
        response = self._session.delete("https://" + self._service_url + f"/realityconversion/jobs/{job_id}",
                                        headers=self._get_header())
        try:
            if response.status_code < 200 or response.status_code >= 400:
                data_json = response.json()
                return ReturnValue(value=False, error=self._error_msg(response.status_code, data_json))
            return ReturnValue(value=True, error="")
        except json.decoder.JSONDecodeError:
            return ReturnValue(value=False, error=self._error_msg(response.status_code, {"error": {"message": response.text}}))
