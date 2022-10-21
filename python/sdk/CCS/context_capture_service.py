import http.client
import json

from apim_utils.code import Code
from token_factory import token_factory
from sdk.CCS.ccs_utils import CCWorkspaceProperties, CCJobType, CCJobQuality, CCJobSettings, CCJobCostParameters, \
    CCJobProperties
from sdk.utils import ReturnValue, JobState, JobDateTime, JobProgress


class ContextCaptureService:

    def __init__(self, service_URL: str, client_id: str, secret: str = "") -> None:
        # must change url to prod one!
        self._token_factory = token_factory.ServiceTokenFactory(
            client_id,
            "qa-ims.bentley.com",
            [
                "realitydata:modify",
                "realitydata:read",
                "contextcapture:modify",
                "contextcapture:read",
                "offline_access",
            ],
        )
        self._connection = http.client.HTTPSConnection(service_URL)
        self._secret = secret

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

    def create_workspace(self, work_name: str, iTwin_id: str, cc_version: str = "") -> ReturnValue[str]:
        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value="", error=ret.error)
        wc_dict = {"name": work_name, "iTwin_id": iTwin_id}
        if cc_version != "":
            wc_dict["contextCaptureVersion"] = cc_version
        json_data = json.dumps(wc_dict)
        self._connection.request("POST", "/contextcapture/workspaces", json_data, self._headers_modify())
        response = self._connection.getresponse()

        # if the query was successful we return the id of the workspace, else we return an empty string
        code = Code(response)
        if not code.success():
            return ReturnValue(value="", error=code.error_message())
        data = code.response()
        return ReturnValue(value=data["workspace"]["id"], error="")

    def delete_workspace(self, work_id: str) -> ReturnValue[bool]:

        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value="", error=ret.error)
        self._connection.request("DELETE", f"/contextcapture/workspaces/{work_id}", None, self._headers_modify())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=False, error=code.error_message())
        return ReturnValue(value=True, error="")

    def get_workspace_properties(self, work_id: str) -> ReturnValue[CCWorkspaceProperties]:
        """

        Args:
            work_id:

        Returns:

        """
        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value=CCWorkspaceProperties(), error=ret.error)
        self._connection.request("GET", f"/contextcapture/workspaces/{work_id}", None, self._headers_read())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=CCWorkspaceProperties(), error=code.error_message())
        data = code.response()
        return ReturnValue(
            value=CCWorkspaceProperties(work_id=data["workspace"]["id"], created_date_time=data["workspace"]["id"],
                                        work_name=data["name"]["id"], iTwin_id=data["iTwinId"]["id"],
                                        context_capture_version=data["contextCaptureVersion"]["id"]), error="")

    def create_job(self, job_type: CCJobType, settings: CCJobSettings, job_name: str, work_id: str) -> ReturnValue[
            str]:
        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value="", error=ret.error)
        settings_dict, inputs_dict = settings.to_json()
        jc_dict = {
            "type": job_type.value,
            "name": job_name,
            "inputs": inputs_dict["inputs"],
            "workspaceId": work_id,
            "settings": settings_dict["settings"]
        }
        job_json = json.dumps(jc_dict)
        print(job_json)
        self._connection.request("POST", "/contextcapture/jobs", job_json, self._headers_modify())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return ReturnValue(value="", error=code.error_message())
        data = code.response()
        return ReturnValue(value=data["job"], error="")

    def submit_job(self, job_id: str) -> ReturnValue[bool]:
        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value=False, error=ret.error)
        jc_dict = {
            "state": "active",
        }
        job_json = json.dumps(jc_dict)
        self._connection.request("PATCH", f"/contextcapture/jobs/{job_id}", job_json, self._headers_modify())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return ReturnValue(value=False, error=code.error_message())
        return ReturnValue(value=True, error="")

    def cancel_job(self, job_id: str) -> ReturnValue[bool]:
        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value=False, error=ret.error)
        jc_dict = {
            "state": "cancelled",
        }
        job_json = json.dumps(jc_dict)

        self._connection.request("PATCH", f"/contextcapture/jobs/{job_id}", job_json, self._headers_modify())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=False, error=code.error_message())
        return ReturnValue(value=True, error="")

    def delete_job(self, job_id: str) -> ReturnValue[bool]:
        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value=False, error=ret.error)
        self._connection.request("DELETE", f"/contextcapture/jobs/{job_id}", None, self._headers_modify())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=False, error=code.error_message())
        return ReturnValue(value=True, error="")

    def get_job_properties(self, job_id: str) -> ReturnValue[CCJobProperties]:
        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value=CCJobProperties(), error=ret.error)
        self._connection.request("GET", f"/contextcapture/jobs/{job_id}", None, self._headers_read())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return ReturnValue(value=CCJobProperties(), error=code.error_message())
        data = code.response()
        try:
            job_name = data["job"].get("name", "")
            job_type = CCJobType(data["job"].get("type", CCJobType.NONE.value))
            job_state = JobState(data["job"].get("state", JobState.UNKNOWN.value))

            cost_estimation_parameters = CCJobCostParameters()
            estimate = data["job"].get("costEstimationParameters", None)
            if estimate is not None:
                cost_estimation_parameters.giga_pixels = float(estimate.get("gigaPixels", 0.0))
                cost_estimation_parameters.mega_points = float(estimate.get("megaPoints", 0.0))
                cost_estimation_parameters.mesh_quality = CCJobQuality(estimate.get("meshQuality", CCJobQuality.UNKNOWN.value))
            estimated_cost = float(data["job"].get("estimatedCost", 0.0))
            created_date_time = data["job"].get("createdDateTime", "")
            execution = data["job"].get("executionInformation", None)
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

            iTwin_id = data["job"].get("iTwinId", "")
            location = data["job"].get("location", "")
            email = data["job"].get("email", "")
            work_id = data["job"].get("workspaceId", "")

            job_settings = CCJobSettings.from_json(data["job"].get("jobSettings", []), data["job"].get("inputs", []))
            if job_settings.is_error():
                return ReturnValue(value=CCJobProperties(), error=job_settings.error)
        except Exception as e:
            return ReturnValue(value=CCJobProperties(), error=str(e))
        return ReturnValue(value=CCJobProperties(job_id=job_id,
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
                                                 estimated_cost=estimated_cost), error="")

    def get_job_settings(self, job_id: str) -> ReturnValue[CCJobSettings]:
        ret = self.get_job_properties(job_id)
        return ReturnValue(value=ret.value.job_settings, error=ret.error)

    def get_job_iTwin_id(self, job_id: str) -> ReturnValue[str]:
        ret = self.get_job_properties(job_id)
        return ReturnValue(value=ret.value.iTwin_id, error=ret.error)

    def get_job_name(self, job_id: str) -> ReturnValue[str]:
        ret = self.get_job_properties(job_id)
        return ReturnValue(value=ret.value.job_name, error=ret.error)

    def get_job_state(self, job_id: str) -> ReturnValue[JobState]:
        ret = self.get_job_properties(job_id)
        return ReturnValue(value=ret.value.job_state, error=ret.error)

    def get_job_dates(self, job_id: str) -> ReturnValue[JobDateTime]:
        ret = self.get_job_properties(job_id)
        return ReturnValue(value=ret.value.job_date_time, error=ret.error)

    def get_job_execution_cost(self, job_id: str) -> ReturnValue[float]:
        ret = self.get_job_properties(job_id)
        return ReturnValue(value=ret.value.estimated_units, error=ret.error)

    def get_job_type(self, job_id: str) -> ReturnValue[CCJobType]:
        ret = self.get_job_properties(job_id)
        return ReturnValue(value=ret.value.job_type, error=ret.error)

    def get_job_progress(self, job_id: str) -> ReturnValue[JobProgress]:
        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value=JobProgress(state=JobState.UNKNOWN, progress=-1, step=""), error=ret.error)
        self._connection.request("GET", f"/contextcapture/jobs/{job_id}/progress", None, self._headers_read())
        response = self._connection.getresponse()

        code = Code(response)
        if not code.success():
            return ReturnValue(
                value=JobProgress(state=JobState.UNKNOWN, progress=-1, step=""),
                error=code.error_message(),
            )
        data = code.response()
        dp = data["jobProgress"]
        return ReturnValue(
            value=JobProgress(
                state=JobState(dp["state"]),
                progress=int(dp["percentage"]),
                step=dp["step"],
            ),
            error="",
        )

    def get_job_estimated_cost(self, job_id: str, cost_parameters: CCJobCostParameters) -> ReturnValue[float]:
        ret = self.connect()
        if ret.is_error():
            return ReturnValue(value=-1.0, error=ret.error)
        pi_dict = {"gigaPixels": str(cost_parameters.giga_pixels),
                   "megaPoints": str(cost_parameters.mega_points),
                   "meshQuality": cost_parameters.mesh_quality.value,
                   }
        json_data = json.dumps(pi_dict)
        self._connection.request("PATCH", f"/contextcapture/jobs/{job_id}", json_data, self._headers_read())
        response = self._connection.getresponse()
        code = Code(response)
        if not code.success():
            return ReturnValue(value=-1.0, error=code.error_message())
        data = code.response()
        ret = float(data["job"].get("estimatedCost", -1.0))
        if ret != -1.0:
            return ReturnValue(value=ret, error="")
        return ReturnValue(value=ret, error="No estimatedCost field in received json")
