import http.client
import json

from token_factory import token_factory
from apim_utils.code import Code

from sdk.rdas_sdk.rdas_utils import JobType, JobProgress, JobStatus
from sdk.rdas_sdk.job_settings import JobSettings, O2DJobSettings, O3DJobSettings, S2DJobSettings, S3DJobSettings, L3DJobSettings, ChangeDetectionJobSettings
from sdk.utils import ReturnValue


class ServiceRda:
    """
    Service handling communication with RealityData Analysis Service
    """

    def __init__(self, service_URL: str, project_id: str, client_id: str) -> None:
        """
        :param service_URL: url of the RealityData Analysis Service
        :param project_id: ID of the project where results should be saved
        :param client_id: a client ID with realitydata and realitydataanalysis scopes
        """
        # must change urls to prod ones!
        self._token_factory = token_factory.ServiceTokenFactory(client_id, "qa-ims.bentley.com",
                                                                ["realitydata:modify", "realitydata:read",
                                                                 "realitydataanalysis:read",
                                                                 "realitydataanalysis:modify", "offline_access"])
        self._connection = http.client.HTTPSConnection(service_URL)
        self.service_url = service_URL
        self.project_id = project_id
        self.client_id = client_id

    def _refresh_connection(self) -> None:
        self._connection.connect()

    def _headers_read(self) -> dict:
        r = {"Authorization": self._token_factory.get_read_token(),
             "User-Agent": f"RDAS Python SDK/0.0.1",
             "Content-type": "application/json",
             "Accept": "application/vnd.bentley.v1+json"}
        return r

    def _headers_modify(self) -> dict:
        r = {"Authorization": self._token_factory.get_modify_token(),
             "User-Agent": f"RDAS Python SDK/0.0.1",
             "Content-type": "application/json",
             "Accept": "application/vnd.bentley.v1+json"}
        return r

    def init(self) -> ReturnValue[bool]:
        try:
            self._refresh_connection()
        except Exception as e:
            return ReturnValue(value=False, error=str(e))
        return ReturnValue(value=True, error="")

    def _create_job(self, settings: JobSettings, job_name: str) -> ReturnValue[str]:
        # take job_settings and create the json settings we need to send
        jc_dict = {
            "type": settings.type.value,
            "name": job_name,
            "iTwinId": self.project_id,
            "settings": settings.to_json()
        }
        job_json = json.dumps(jc_dict)
        # send the json settings
        self._connection.request("POST", "/realitydataanalysis/jobs", job_json, self._headers_modify())
        response = self._connection.getresponse()
        # if the query was successful we return the id of the job, else we return an empty string and the error message
        code = Code(response)
        if not code.success():
            return ReturnValue(value="", error=code.error_message())
        data = code.response()
        return ReturnValue(value=data["job"]["id"], error="")

    def submit_job(self, settings: JobSettings, job_name: str) -> ReturnValue[str]:
        """
        Submit a job corresponding to the given settings

        :param settings: Settings for the job
        :param job_name: Name for the job
        :return: The ID of the job, and a potential error message
        """
        try:
            self._refresh_connection()
        except Exception as e:
            return ReturnValue(value=False, error=str(e))
        # create a new job
        ret = self._create_job(settings, job_name)
        if ret.is_error():
            return ReturnValue(value=ret.value, error=ret.error)
        # submit the job
        jc_dict = {"state": "active"}
        job_json = json.dumps(jc_dict)
        self._connection.request("PATCH", f"/realitydataanalysis/jobs/{ret.value}", job_json, self._headers_modify())
        response = self._connection.getresponse()
        # if the query was successful we return the id of the job, else we return an empty string and the error message
        code = Code(response)
        if not code.success():
            return ReturnValue(value="", error=code.error_message())
        data = code.response()
        return ReturnValue(value=data["job"]["id"], error="")

    def get_job_type(self, job_id: str) -> ReturnValue[JobType]:
        """
        Get type of a given job

        :param job_id: The ID of the relevant job
        :return: The type for the job, and a potential error message
        """
        try:
            self._refresh_connection()
        except Exception as e:
            return ReturnValue(value=False, error=str(e))
        self._connection.request("GET", f"/realitydataanalysis/jobs/{job_id}", None, self._headers_read())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=JobType.NONE, error=code.error_message())
        data = code.response()
        return ReturnValue(value=JobType(data["job"]["type"]), error="")

    def get_job_progress(self, job_id: str) -> ReturnValue[JobProgress]:
        """
        Get progress for a given job

        :param job_id: The ID of the relevant job
        :return: The progress for the job, and a potential error message
        """
        try:
            self._refresh_connection()
        except Exception as e:
            return ReturnValue(value=JobProgress(JobStatus=JobStatus.UNKNOWN, progress=-1, step=""), error=str(e))
        self._connection.request("GET", f"/realitydataanalysis/jobs/{job_id}/progress", None, self._headers_read())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return ReturnValue(value=JobProgress(status=JobStatus.UNKNOWN, progress=-1, step=""),
                               error=code.error_message())
        data = code.response()
        dp = data["progress"]
        return ReturnValue(
            value=JobProgress(status=JobStatus(dp["state"]), progress=int(dp["percentage"]), step=dp["step"]), error="")

    def get_O2DJobSettings(self, job_id: str) -> ReturnValue[O2DJobSettings]:
        """
        Get settings for a given job

        :param job_id: The ID of the relevant job
        :return: The settings for the job, and a potential error message
        """
        try:
            self._refresh_connection()
        except Exception as e:
            return ReturnValue(value=O2DJobSettings(), error=str(e))
        self._connection.request("GET", f"/realitydataanalysis/jobs/{job_id}", None, self._headers_read())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=O2DJobSettings(), error=code.error_message())
        data = code.response()
        if data["job"]["type"] != "objects2D":
            return ReturnValue(value=O2DJobSettings(), error="retrieved Job is not an Objects2D Job")
        return O2DJobSettings.from_json(data["job"]["settings"])

    def get_O3DJobSettings(self, job_id: str) -> ReturnValue[O3DJobSettings]:
        """
        Get settings for a given job

        :param job_id: The ID of the relevant job
        :return: The settings for the job, and a potential error message
        """
        try:
            self._refresh_connection()
        except Exception as e:
            return ReturnValue(value=O3DJobSettings(), error=str(e))
        self._connection.request("GET", f"/realitydataanalysis/jobs/{job_id}", None, self._headers_read())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=O3DJobSettings(), error=code.error_message())
        data = code.response()
        if data["job"]["type"] != "objects3D":
            return ReturnValue(value=O3DJobSettings(), error="retrieved Job is not a Objects3D Job")
        return O3DJobSettings.from_json(data["job"]["settings"])

    def get_S2DJobSettings(self, job_id: str) -> ReturnValue[S2DJobSettings]:
        """
        Get settings for a given job

        :param job_id: The ID of the relevant job
        :return: The settings for the job, and a potential error message
        """
        try:
            self._refresh_connection()
        except Exception as e:
            return ReturnValue(value=S2DJobSettings(), error=str(e))
        self._connection.request("GET", f"/realitydataanalysis/jobs/{job_id}", None, self._headers_read())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=S2DJobSettings(), error=code.error_message())
        data = code.response()
        if data["job"]["type"] != "segmentation2D":
            return ReturnValue(value=S2DJobSettings(), error="retrieved Job is not a Segmentation2D Job")
        return S2DJobSettings.from_json(data["job"]["settings"])

    def get_S3DJobSettings(self, job_id: str) -> ReturnValue[S3DJobSettings]:
        """
        Get settings for a given job

        :param job_id: The ID of the relevant job
        :return: The settings for the job, and a potential error message
        """
        try:
            self._refresh_connection()
        except Exception as e:
            return ReturnValue(value=S3DJobSettings(), error=str(e))
        self._connection.request("GET", f"/realitydataanalysis/jobs/{job_id}", None, self._headers_read())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=S3DJobSettings(), error=code.error_message())
        data = code.response()
        if data["job"]["type"] != "segmentation3D":
            return ReturnValue(value=S3DJobSettings(), error="retrieved Job is not a Segmentation3D Job")
        return S3DJobSettings.from_json(data["job"]["settings"])

    def get_L3DJobSettings(self, job_id: str) -> ReturnValue[L3DJobSettings]:
        """
        Get settings for a given job

        :param job_id: The ID of the relevant job
        :return: The settings for the job, and a potential error message
        """
        try:
            self._refresh_connection()
        except Exception as e:
            return ReturnValue(value=L3DJobSettings(), error=str(e))
        self._connection.request("GET", f"/realitydataanalysis/jobs/{job_id}", None, self._headers_read())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=L3DJobSettings(), error=code.error_message())
        data = code.response()
        if data["job"]["type"] != "lines3D":
            return ReturnValue(value=L3DJobSettings(), error="retrieved Job is not a Lines3D Job")
        return L3DJobSettings.from_json(data["job"]["settings"])

    def get_ChangeDetectionJobSettings(self, job_id: str) -> ReturnValue[ChangeDetectionJobSettings]:
        """
        Get settings for a given job

        :param job_id: The ID of the relevant job
        :return: The settings for the job, and a potential error message
        """
        try:
            self._refresh_connection()
        except Exception as e:
            return ReturnValue(value=ChangeDetectionJobSettings(), error=str(e))
        self._connection.request("GET", f"/realitydataanalysis/jobs/{job_id}", None, self._headers_read())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=ChangeDetectionJobSettings(), error=code.error_message())
        data = code.response()
        if data["job"]["type"] != "changeDetection":
            return ReturnValue(value=ChangeDetectionJobSettings(),
                               error="retrieved Job is not a ChangeDetection Job")
        return ChangeDetectionJobSettings.from_json(data["job"]["settings"])

    def cancel_job(self, job_id: str) -> ReturnValue[bool]:
        """
        Cancel a job

        :param job_id: The ID of the job to be cancelled
        :return: True if the job was successfully cancelled, and a potential error message
        """
        try:
            self._refresh_connection()
        except Exception as e:
            return ReturnValue(value=False, error=str(e))
        jc_dict = {
            "state": "cancelled",
        }
        job_json = json.dumps(jc_dict)
        self._connection.request("PATCH", f"/realitydataanalysis/jobs/{job_id}", job_json, self._headers_modify())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=False, error=code.error_message())
        return ReturnValue(value=True, error="")
