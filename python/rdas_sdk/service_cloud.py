import http.client
import json

from token_factory import token_factory
from apim_utils.code import Code

from utils import ReturnValue, JobType, JobProgress, JobStatus
import job_settings


class ServiceCloud:
    """
    Service handling communication with RealityData Analysis Service
    """

    def __init__(self, service_URL: str, project_id, client_id: str) -> None:
        """
        :param service_URL: url of the RealityData Analysis Service
        :param project_id: ID of the project where results should be saved
        :param client_id: a client ID with realitydata and realitydataanalysis scopes
        """
        # must change url to prod one
        self._token_factory = token_factory.ServiceTokenFactory(client_id, "qa-ims.bentley.com",
                                                                ["realitydata:modify", "realitydata:read",
                                                                 "realitydataanalysis:read",
                                                                 "realitydataanalysis:modify", "offline_access"])
        self._connection = http.client.HTTPSConnection(service_URL)
        self.client_id = client_id
        self.project_id = project_id

    def _headers_read(self):
        r = {"Authorization": self._token_factory.get_read_token(),
             "User-Agent": f"RDAS Python SDK/0.0.1",
             "Content-type": "application/json",
             "Accept": "application/vnd.bentley.itwin-platform.v1+json"}
        return r

    def _headers_modify(self):
        r = {"Authorization": self._token_factory.get_modify_token(),
             "User-Agent": f"RDAS Python SDK/0.0.1",
             "Content-type": "application/json",
             "Accept": "application/vnd.bentley.itwin-platform.v1+json"}
        return r

    def init(self) -> ReturnValue[bool]:
        try:
            self._connection.connect()
        except Exception as e:
            return ReturnValue(value=False, error=str(e))
        return ReturnValue(value=True, error="")

    def _create_job(self, settings: job_settings.JobSettings, job_name: str):
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
            return ReturnValue(value="", error=code.error_message)
        data = code.response()
        return ReturnValue(value=data["job"]["id"], error="")

    def submit_job(self, settings: job_settings.JobSettings, job_name: str) -> ReturnValue[str]:
        """
        Submit a job corresponding to the given settings

        :param settings: Settings for the job
        :param job_name: Name for the job
        :return: The ID of the job, and a potential error message
        """
        # create a new job
        ret = self._create_job(settings, job_name)
        if ret.is_error():
            ReturnValue(value=ret.value, error=ret.error)
        # submit the job
        jc_dict = {"state": "active"}
        job_json = json.dumps(jc_dict)
        self._connection.request("PATCH", f"/realitydataanalysis/jobs/{ret.value}", job_json, self._headers_modify())
        response = self._connection.getresponse()
        # if the query was successful we return the id of the job, else we return an empty string and the error message
        code = Code(response)
        if not code.success():
            return ReturnValue(value="", error=code.error_message)
        data = code.response()
        return ReturnValue(value=data["job"]["id"], error="")

    def get_job_type(self, job_id: str) -> ReturnValue[JobType]:
        """
        Get type of a given job

        :param job_id: The ID of the relevant job
        :return: The type for the job, and a potential error message
        """
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

    def get_O2DJobSettings(self, job_id: str) -> ReturnValue[job_settings.O2DJobSettings]:
        """
        Get settings for a given job

        :param job_id: The ID of the relevant job
        :return: The settings for the job, and a potential error message
        """
        self._connection.request("GET", f"/realitydataanalysis/jobs/{job_id}", None, self._headers_read())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=job_settings.O2DJobSettings(), error=code.error_message())
        data = code.response()
        if data["job"]["type"] != "objects2D":
            return ReturnValue(value=job_settings.O2DJobSettings(), error="retrieved Job is not an Objects2D Job")
        return job_settings.O2DJobSettings.from_json(data["job"]["settings"])

    def get_O3DJobSettings(self, job_id: str) -> ReturnValue[job_settings.O3DJobSettings]:
        """
        Get settings for a given job

        :param job_id: The ID of the relevant job
        :return: The settings for the job, and a potential error message
        """
        self._connection.request("GET", f"/realitydataanalysis/jobs/{job_id}", None, self._headers_read())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=job_settings.O3DJobSettings(), error=code.error_message())
        data = code.response()
        if data["job"]["type"] != "objects3D":
            return ReturnValue(value=job_settings.O3DJobSettings(), error="retrieved Job is not a Objects3D Job")
        return job_settings.O3DJobSettings.from_json(data["job"]["settings"])

    def get_S2DJobSettings(self, job_id: str) -> ReturnValue[job_settings.S2DJobSettings]:
        """
        Get settings for a given job

        :param job_id: The ID of the relevant job
        :return: The settings for the job, and a potential error message
        """
        self._connection.request("GET", f"/realitydataanalysis/jobs/{job_id}", None, self._headers_read())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=job_settings.S2DJobSettings(), error=code.error_message())
        data = code.response()
        if data["job"]["type"] != "segmentation2D":
            return ReturnValue(value=job_settings.S2DJobSettings(), error="retrieved Job is not a Segmentation2D Job")
        return job_settings.S2DJobSettings.from_json(data["job"]["settings"])

    def get_S3DJobSettings(self, job_id: str) -> ReturnValue[job_settings.S3DJobSettings]:
        """
        Get settings for a given job

        :param job_id: The ID of the relevant job
        :return: The settings for the job, and a potential error message
        """
        self._connection.request("GET", f"/realitydataanalysis/jobs/{job_id}", None, self._headers_read())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=job_settings.S3DJobSettings(), error=code.error_message())
        data = code.response()
        if data["job"]["type"] != "segmentation3D":
            return ReturnValue(value=job_settings.S3DJobSettings(), error="retrieved Job is not a Segmentation3D Job")
        return job_settings.S3DJobSettings.from_json(data["job"]["settings"])

    def get_L3DJobSettings(self, job_id: str) -> ReturnValue[job_settings.L3DJobSettings]:
        """
        Get settings for a given job

        :param job_id: The ID of the relevant job
        :return: The settings for the job, and a potential error message
        """
        self._connection.request("GET", f"/realitydataanalysis/jobs/{job_id}", None, self._headers_read())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=job_settings.L3DJobSettings(), error=code.error_message())
        data = code.response()
        if data["job"]["type"] != "lines3D":
            return ReturnValue(value=job_settings.L3DJobSettings(), error="retrieved Job is not a Lines3D Job")
        return job_settings.L3DJobSettings.from_json(data["job"]["settings"])

    def get_ChangeDetectionJobSettings(self, job_id: str) -> ReturnValue[job_settings.ChangeDetectionJobSettings]:
        """
        Get settings for a given job

        :param job_id: The ID of the relevant job
        :return: The settings for the job, and a potential error message
        """
        self._connection.request("GET", f"/realitydataanalysis/jobs/{job_id}", None, self._headers_read())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=job_settings.ChangeDetectionJobSettings(), error=code.error_message())
        data = code.response()
        if data["job"]["type"] != "changeDetection":
            return ReturnValue(value=job_settings.ChangeDetectionJobSettings(),
                               error="retrieved Job is not a ChangeDetection Job")
        return job_settings.ChangeDetectionJobSettings.from_json(data["job"]["settings"])

    def cancel_job(self, job_id: str) -> ReturnValue[bool]:
        """
        Cancel a job

        :param job_id: The ID of the job to be cancelled
        :return: True if the job was successfully cancelled, and a potential error message
        """
        jc_dict = {
            "state": "cancelled",
        }
        job_json = json.dumps(jc_dict)
        self._connection.request("PATCH", f"/realitydataanalysis/jobs/{job_id}", job_json, self._headers_modify())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=False, error=code.error_message)
        return ReturnValue(value=True, error="")
