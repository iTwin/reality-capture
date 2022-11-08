import http.client
import json

from apim_utils.code import Code
from sdk.RDAS.rdas_utils import (
    RDAJobCostParameters,
    RDAJobProperties,
)
from sdk.RDAS.rdas_enums import RDAJobType
from sdk.RDAS.job_settings import (
    JobSettings,
    O2DJobSettings,
    O3DJobSettings,
    S2DJobSettings,
    S3DJobSettings,
    L3DJobSettings,
    ChangeDetectionJobSettings,
)
from sdk.utils import ReturnValue, JobProgress, JobState, JobDateTime


class RealityDataAnalysisService:
    """
    Service handling communication with RealityData Analysis Service.

    Args:
        token_factory: An object that implements the abstract functions in AbstractTokenFactory. Used to retrieve the
        service url and the authorization token used to connect with the service.
    """

    def __init__(self, token_factory) -> None:
        self._token_factory = token_factory
        self._connection = http.client.HTTPSConnection(
            self._token_factory.get_service_url()
        )
        self._header = {
            "Authorization": None,
            "User-Agent": f"RDAS Python SDK/0.0.1",
            "Content-type": "application/json",
            "Accept": "application/vnd.bentley.itwin-platform.v1+json",
        }

    def _get_header(self) -> dict:
        self._header["Authorization"] = self._token_factory.get_token()
        return self._header

    def _connect(self) -> ReturnValue[bool]:
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
        ret = self._connect()
        if ret.is_error():
            return ReturnValue(value="", error=ret.error)
        # take job_settings and create the json settings we need to send
        jc_dict = {
            "name": job_name,
            "iTwinId": iTwin_id,
            "type": settings.type.value,
            "settings": settings.to_json(),
        }
        job_json = json.dumps(jc_dict)
        # send the json settings
        self._connection.request(
            "POST", "/realitydataanalysis/jobs", job_json, self._get_header()
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

        ret = self._connect()
        if ret.is_error():
            return ReturnValue(value=False, error=ret.error)
        jc_dict = {"state": "active"}
        job_json = json.dumps(jc_dict)
        self._connection.request(
            "PATCH",
            f"/realitydataanalysis/jobs/{job_id}",
            job_json,
            self._get_header(),
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
            job_id: The ID of the relevant job.

        Returns:
            The properties of the job, and a potential error message.
        """
        ret = self._connect()
        if ret.is_error():
            return ReturnValue(value=RDAJobProperties(), error=ret.error)
        self._connection.request(
            "GET", f"/realitydataanalysis/jobs/{job_id}", None, self._get_header()
        )
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=RDAJobProperties(), error=code.error_message())
        data = code.response()
        try:
            job_type_str = data["job"].get("type", None)
            if job_type_str is None:
                return ReturnValue(value=RDAJobProperties(), error="no Job type")

            if job_type_str == RDAJobType.O2D.value:
                settings = O2DJobSettings.from_json(data["job"].get("settings", {}))
            elif job_type_str == RDAJobType.S2D.value:
                settings = S2DJobSettings.from_json(data["job"].get("settings", {}))
            elif job_type_str == RDAJobType.O3D.value:
                settings = O3DJobSettings.from_json(data["job"].get("settings", {}))
            elif job_type_str == RDAJobType.S3D.value:
                settings = S3DJobSettings.from_json(data["job"].get("settings", {}))
            elif job_type_str == RDAJobType.L3D.value:
                settings = L3DJobSettings.from_json(data["job"].get("settings", {}))
            elif job_type_str == RDAJobType.ChangeDetection.value:
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

            created_date_time = data["job"].get("createdDateTime", "")
            execution = data["job"].get("executionInformation", None)
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

            job_state = data["job"].get("state", JobState.UNKNOWN)
            job_name = data["job"].get("name", "")
            itwin_id = data["job"].get("projectId", "")
            data_center = data["job"].get("dataCenter", "")
            email = data["job"].get("dataCenter", "")
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

    def get_job_state(self, job_id: str) -> ReturnValue[JobState]:
        """
        Get the state of a job.

        Args:
            job_id: The ID of the relevant job.
        Returns:
            The state of the job, and a potential error message.
        """
        ret = self.get_job_properties(job_id)
        return ReturnValue(value=ret.value.job_state, error=ret.error)

    def get_job_dates(self, job_id: str) -> ReturnValue[JobDateTime]:
        """
        Get important dates of a job.

        Args:
            job_id: The ID of the relevant job.
        Returns:
            Dates times of the job, and a potential error message.
        """
        ret = self.get_job_properties(job_id)
        return ReturnValue(value=ret.value.job_date_time, error=ret.error)

    def get_job_execution_cost(self, job_id: str) -> ReturnValue[float]:
        """
        Get estimated execution cost of an executed job.

        Args:
            job_id: The ID of the relevant job.
        Returns:
            Estimated execution cost of the job, and a potential error message.
        """
        ret = self.get_job_properties(job_id)
        return ReturnValue(value=ret.value.estimated_units, error=ret.error)

    def get_job_exit_code(self, job_id: str) -> ReturnValue[int]:
        """
        Get exit code of a given executed job.

        Args:
            job_id: The ID of the relevant job.
        Returns:
            The exit code of the job, and a potential error message.
        """
        ret = self.get_job_properties(job_id)
        return ReturnValue(value=ret.value.exit_code, error=ret.error)

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

    def get_job_progress(self, job_id: str) -> ReturnValue[JobProgress]:
        """
        Get progress for a given job.

        Args:
            job_id: The ID of the relevant job.
        Returns:
            The progress for the job, and a potential error message.
        """
        ret = self._connect()
        if ret.is_error():
            return ReturnValue(
                value=JobProgress(state=JobState.UNKNOWN, progress=-1, step=""),
                error=ret.error,
            )
        self._connection.request(
            "GET",
            f"/realitydataanalysis/jobs/{job_id}/progress",
            None,
            self._get_header(),
        )
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return ReturnValue(
                value=JobProgress(state=JobState.UNKNOWN, progress=-1, step=""),
                error=code.error_message(),
            )
        data = code.response()
        dp = data["progress"]
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
        ret = self._connect()
        if ret.is_error():
            return ReturnValue(value=-1.0, error=ret.error)
        jc_dict = {"costEstimation": cost_parameters.to_json()}
        job_json = json.dumps(jc_dict)
        self._connection.request(
            "PATCH",
            f"/realitydataanalysis/jobs/{job_id}",
            job_json,
            self._get_header(),
        )
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=-1.0, error=code.error_message())
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
        ret = self._connect()
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
            self._get_header(),
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
        ret = self._connect()
        if ret.is_error():
            return ReturnValue(value=False, error=ret.error)
        self._connection.request(
            "DELETE",
            f"/realitydataanalysis/jobs/{job_id}",
            None,
            self._get_header(),
        )
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=False, error=code.error_message())
        return ReturnValue(value=True, error="")
