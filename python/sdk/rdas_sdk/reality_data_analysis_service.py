import http.client
import json

from token_factory import token_factory
from apim_utils.code import Code

from sdk.rdas_sdk.rdas_utils import (
    RDAJobCostParameters,
    RDAJobExecutionInfo,
    RDAJobProperties,
)
from sdk.rdas_sdk.rdas_enums import RDAJobType
from sdk.rdas_sdk.job_settings import (
    JobSettings,
    O2DJobSettings,
    O3DJobSettings,
    S2DJobSettings,
    S3DJobSettings,
    L3DJobSettings,
    ChangeDetectionJobSettings,
)
from sdk.utils import ReturnValue, JobProgress, JobStatus


class RealityDataAnalysisService:
    """
    Service handling communication with RealityData Analysis Service.

    Args:
        service_URL: url of the RealityData Analysis Service.
        client_id: a client ID with at least realitydata and realitydataanalysis scopes.
    """

    def __init__(self, service_URL: str, client_id: str) -> None:
        # must change url to prod one!
        self._token_factory = token_factory.ServiceTokenFactory(
            client_id,
            "qa-ims.bentley.com",
            [
                "realitydata:modify",
                "realitydata:read",
                "realitydataanalysis:read",
                "realitydataanalysis:modify",
                "offline_access",
            ],
        )
        self._connection = http.client.HTTPSConnection(service_URL)

    def _headers_read(self) -> dict:
        r = {
            "Authorization": self._token_factory.get_read_token(),
            "User-Agent": f"RDAS Python SDK/0.0.1",
            "Content-type": "application/json",
            "Accept": "application/vnd.bentley.v1+json",
        }
        return r

    def _headers_modify(self) -> dict:
        r = {
            "Authorization": self._token_factory.get_modify_token(),
            "User-Agent": f"RDAS Python SDK/0.0.1",
            "Content-type": "application/json",
            "Accept": "application/vnd.bentley.v1+json",
        }
        return r

    def connect(self) -> ReturnValue[bool]:
        """
        Connects to the service.

        Returns:
            True if connected to the service, and a potential error message.
        """
        try:
            self._connection.connect()
        except Exception as e:
            return ReturnValue(value=False, error=str(e))
        return ReturnValue(value=True, error="")

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
        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value="", error=ret.error)
        # take job_settings and create the json settings we need to send
        jc_dict = {
            "type": settings.type.value,
            "name": job_name,
            "iTwinId": iTwin_id,
            "settings": settings.to_json(),
        }
        job_json = json.dumps(jc_dict)
        # send the json settings
        self._connection.request(
            "POST", "/realitydataanalysis/jobs", job_json, self._headers_modify()
        )
        response = self._connection.getresponse()
        # if the query was successful we return the id of the job, else we return an empty string and the error message
        code = Code(response)
        if not code.success():
            return ReturnValue(value="", error=code.error_message())
        data = code.response()
        return ReturnValue(value=data["job"]["id"], error="")

    def submit_job(self, job_id: str) -> ReturnValue[bool]:
        """
        Submit a job.

        Args:
            job_id: The ID of the job to be submitted.
        Returns:
            True if the job was successfully submitted, and a potential error message.
        """

        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value=False, error=ret.error)
        jc_dict = {"state": "active"}
        job_json = json.dumps(jc_dict)
        self._connection.request(
            "PATCH",
            f"/realitydataanalysis/jobs/{job_id}",
            job_json,
            self._headers_modify(),
        )
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=False, error=code.error_message())
        return ReturnValue(value=True, error="")

    def get_job_properties(self, job_id: str) -> ReturnValue[RDAJobProperties]:
        """
        Get all properties of a given job.
        By default this function returns a placeholder empty RDAJobProperties if it hasn't succeeded in retrieving job
        settings. Use is_error() to be sure the return value is valid.
        Args:
            job_id: job_id: The ID of the relevant job.

        Returns:
            The properties of the job, and a potential error message.
        """
        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value=RDAJobProperties(), error=ret.error)
        self._connection.request(
            "GET", f"/realitydataanalysis/jobs/{job_id}", None, self._headers_read()
        )
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=RDAJobProperties(), error=code.error_message())
        data = code.response()
        try:
            job_type = data["job"].get("type", None)
            if job_type is None:
                return ReturnValue(value=RDAJobProperties(), error="no Job type")

            if job_type == RDAJobType.O2D.value:
                settings = O2DJobSettings.from_json(data["job"].get("settings", {}))
            elif job_type == RDAJobType.S2D.value:
                settings = S2DJobSettings.from_json(data["job"].get("settings", {}))
            elif job_type == RDAJobType.O3D.value:
                settings = O3DJobSettings.from_json(data["job"].get("settings", {}))
            elif job_type == RDAJobType.S3D.value:
                settings = S3DJobSettings.from_json(data["job"].get("settings", {}))
            elif job_type == RDAJobType.L3D.value:
                settings = L3DJobSettings.from_json(data["job"].get("settings", {}))
            elif job_type == RDAJobType.ChangeDetection.value:
                settings = ChangeDetectionJobSettings.from_json(
                    data["job"].get("settings", {})
                )
            else:
                return ReturnValue(
                    value=RDAJobProperties(), error="Job Type not recognized"
                )
            if settings.is_error():
                return ReturnValue(value=RDAJobProperties(), error=settings.error)

            cost_estimation = RDAJobCostParameters()
            estimate = data["job"].get("costEstimation", None)
            if estimate is not None:
                cost_estimation.giga_pixels = estimate.get("gigaPixels", 0.0)
                cost_estimation.number_photos = estimate.get("numberOfPhotos", 0)
                cost_estimation.scene_width = estimate.get("sceneWidth", 0.0)
                cost_estimation.scene_height = estimate.get("sceneHeight", 0.0)
                cost_estimation.scene_length = estimate.get("sceneLength", 0.0)
                cost_estimation.detector_scale = estimate.get("detectorScale", 0.0)
                cost_estimation.detector_cost = estimate.get("detectorCost", 0.0)
                cost_estimation.estimated_cost = estimate.get("estimatedCost", 0.0)

            created_date_time = data["job"].get("createdDateTime", "")
            last_modified_date_time = data["job"].get("lastModifiedDateTime", "")

            execution = data["job"].get("executionInformation", None)
            if execution is not None:
                execution_info = RDAJobExecutionInfo(
                    exit_code=execution.get("exitCode", 0),
                    submission_date_time=execution.get("submissionDateTime", ""),
                    started_date_time=execution.get("startedDateTime", ""),
                    ended_date_time=execution.get("endedDateTime", ""),
                    estimated_units=execution.get("estimatedUnits", 0.0),
                )
            else:
                execution_info = RDAJobExecutionInfo()

            job_status = data["job"].get("state", JobStatus.UNKNOWN)
            job_name = data["job"].get("name", "")
            itwin_id = data["job"].get("projectId", "")
            data_center = data["job"].get("dataCenter", "")
            email = data["job"].get("dataCenter", "")
        except Exception as e:
            return ReturnValue(value=RDAJobProperties(), error=str(e))

        return ReturnValue(
            value=RDAJobProperties(
                job_type=RDAJobType(job_type),
                job_settings=settings.value,
                cost_estimation=cost_estimation,
                created_date_time=created_date_time,
                last_modified_date_time=last_modified_date_time,
                execution_information=execution_info,
                job_status=job_status,
                job_id=job_id,
                job_name=job_name,
                iTwin_id=itwin_id,
                data_center=data_center,
                email=email,
            ),
            error="",
        )

    def get_job_type(self, job_id: str) -> ReturnValue[RDAJobType]:
        """
        Get type of a given job.

        Args:
            job_id: The ID of the relevant job.
        Returns:
            The type for the job, and a potential error message.
        """
        ret = self.get_job_properties(job_id)
        return ReturnValue(value=ret.value.job_type, error=ret.error)

    def get_job_settings(self, job_id: str) -> ReturnValue[JobSettings]:
        """
        Get settings for a given job.
        This function retrieves the RDAJobType and creates the appropriate settings object.
        By default this function returns an empty O2DJobSettings if it didn't succeeded in retrieving settings.
        Use is_error() to be sure the return value is valid.

        Args:
            job_id: The ID of the relevant job.
        Returns:
            The settings for the job, and a potential error message.
        """
        ret = self.get_job_properties(job_id)
        return ReturnValue(value=ret.value.job_settings, error=ret.error)

    def get_job_iTwin_id(self, job_id: str) -> ReturnValue[str]:
        """
        Get the iTwin project ID the given job is linked to.

        Args:
            job_id: The ID of the relevant job.
        Returns:
            The iTwin project ID, and a potential error message.
        """
        ret = self.get_job_properties(job_id)
        return ReturnValue(value=ret.value.iTwin_id, error=ret.error)

    def get_job_name(self, job_id: str) -> ReturnValue[str]:
        """
        Get the name of a job.

        Args:
            job_id: The ID of the relevant job.
        Returns:
            The name of the job, and a potential error message.
        """
        ret = self.get_job_properties(job_id)
        return ReturnValue(value=ret.value.job_name, error=ret.error)

    def get_job_status(self, job_id: str) -> ReturnValue[JobStatus]:
        """
        Get the status of a job.

        Args:
            job_id: The ID of the relevant job.
        Returns:
            The status of the job, and a potential error message.
        """
        ret = self.get_job_properties(job_id)
        return ReturnValue(value=ret.value.job_status, error=ret.error)

    def get_job_progress(self, job_id: str) -> ReturnValue[JobProgress]:
        """
        Get progress for a given job.

        Args:
            job_id: The ID of the relevant job.
        Returns:
            The progress for the job, and a potential error message.
        """
        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value=JobProgress(), error=ret.error)
        self._connection.request(
            "GET",
            f"/realitydataanalysis/jobs/{job_id}/progress",
            None,
            self._headers_read(),
        )
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return ReturnValue(
                value=JobProgress(status=JobStatus.UNKNOWN, progress=-1, step=""),
                error=code.error_message(),
            )
        data = code.response()
        dp = data["progress"]
        return ReturnValue(
            value=JobProgress(
                status=JobStatus(dp["state"]),
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
        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value=False, error=ret.error)
        jc_dict = {"costEstimation": cost_parameters.to_json()}
        job_json = json.dumps(jc_dict)
        self._connection.request(
            "PATCH",
            f"/realitydataanalysis/jobs/{job_id}",
            job_json,
            self._headers_modify(),
        )
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=RDAJobCostParameters(), error=code.error_message())
        data = code.response()
        ret = RDAJobCostParameters.from_json(data["job"]["costEstimation"])
        return ReturnValue(value=ret.value.estimated_cost, error=ret.error)

    def cancel_job(self, job_id: str) -> ReturnValue[bool]:
        """
        Cancel a job.

        Args:
            job_id: The ID of the job to be cancelled.
        Returns:
            True if the job was successfully cancelled, and a potential error message.
        """
        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value=False, error=ret.error)
        jc_dict = {
            "state": "cancelled",
        }
        job_json = json.dumps(jc_dict)
        self._connection.request(
            "PATCH",
            f"/realitydataanalysis/jobs/{job_id}",
            job_json,
            self._headers_modify(),
        )
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=False, error=code.error_message())
        return ReturnValue(value=True, error="")

    def delete_job(self, job_id: str) -> ReturnValue[bool]:
        """
        Delete existing job (job cannot already be submitted to be deleted).

        Args:
            job_id: The ID of the job to be deleted.
        Returns:
            True if the job was successfully deleted, and a potential error message.
        """
        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value=False, error=ret.error)
        self._connection.request(
            "DELETE",
            f"/realitydataanalysis/jobs/{job_id}",
            None,
            self._headers_modify(),
        )
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=False, error=code.error_message())
        return ReturnValue(value=True, error="")

    def get_job_execution_info(self, job_id: str) -> ReturnValue[RDAJobExecutionInfo]:
        """
        Get the execution information of a job.

        Args:
            job_id: The ID of the relevant job.
        Returns:
            The  execution information of the job, and a potential error message.
        """
        ret = self.get_job_properties(job_id)
        return ReturnValue(value=ret.value.execution_information, error=ret.error)

    def get_job_dates(self, job_id: str) -> ReturnValue[dict]:
        """
        Get relevant dates of a job.

        Args:
            job_id: The ID of the relevant job.
        Returns:
            A dictionary with all relevant dates for the job.
        """
        ret = self.get_job_properties(job_id)
        if ret.is_error():
            return ReturnValue(value=dict(), error=ret.error)
        dates_dict = {
            "created_date_time": ret.value.created_date_time,
            "modified_date_time": ret.value.last_modified_date_time,
        }
        exec_info = ret.value.execution_information
        if exec_info.submission_date_time != "":
            dates_dict["submission_date_time"] = exec_info.submission_date_time
        if exec_info.started_date_time != "":
            dates_dict["started_date_time"] = exec_info.started_date_time
        if exec_info.ended_date_time != "":
            dates_dict["ended_date_time"] = exec_info.ended_date_time
        if exec_info.ended_date_time:
            dates_dict["ended_date_time"] = exec_info.ended_date_time
        return ReturnValue(value=dates_dict, error=ret.error)
