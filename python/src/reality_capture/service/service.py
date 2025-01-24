import requests
import json
from reality_capture.service.response import Response
from reality_capture.service.job import JobCreate, Job, Progress
from reality_capture.service.reality_data import (RealityDataCreate, RealityData, RealityDataUpdate, ContainerDetails,
                                                  RealityDataFilter, Prefer, RealityDatas)
from reality_capture import __version__
from typing import Optional


class RealityCaptureService:
    """
    Service handling communication with Reality Capture APIs
    """

    def __init__(self, token_factory, **kwargs) -> None:
        self._token_factory = token_factory
        self._session = requests.Session()

        self._header = {
            "Authorization": None,
            "User-Agent": f"Reality Capture Python SDK/{__version__}",
            "Content-type": "application/json",
            "Accept": "application/vnd.bentley.itwin-platform.v1+json",
        }

        env = kwargs["env"]
        if env == "qa":
            self._service_url = "https://qa-api.bentley.com/realitycapture"
        elif env == "dev":
            self._service_url = "https://dev-api.bentley.com/realitycapture"
        else:
            self._service_url = "https://api.bentley.com/realitycapture"

    def _get_header(self) -> dict:
        self._header["Authorization"] = self._token_factory.get_token()
        return self._header

    def submit_job(self, job: JobCreate) -> Response[Job]:
        response = self._session.patch(self._service_url + "/jobs", job.model_dump_json(by_alias=True),
                                       headers=self._get_header())
        pass

    def get_job(self, job_id: str) -> Response[Job]:
        response = self._session.get(self._service_url + "/jobs/" + job_id, headers=self._get_header())
        pass

    def get_job_progress(self, job_id: str) -> Response[Progress]:
        response = self._session.get(self._service_url + "/jobs/" + job_id + "/progress", headers=self._get_header())
        pass

    def cancel_job(self, job_id: str) -> Response[Job]:
        payload = {
            "state": "cancelled",
        }
        payload_json = json.dumps(payload)
        response = self._session.patch(self._service_url + "/jobs/" + job_id, payload_json, headers=self._get_header())
        pass

    def create_reality_data(self, reality_data: RealityDataCreate) -> Response[RealityData]:
        response = self._session.post(self._service_url + "/reality-data", reality_data.model_dump_json(by_alias=True),
                                      headers=self._get_header())
        pass

    def get_reality_data(self, reality_data_id: str, itwin_id: Optional[str] = None) -> Response[RealityData]:
        url = self._service_url + "/reality-data/" + reality_data_id
        if itwin_id is not None:
            url += "?" + itwin_id
        response = self._session.get(url, headers=self._get_header())
        pass

    def update_reality_data(self, reality_data_update: RealityDataUpdate,
                            reality_data_id: str, itwin_id: Optional[str] = None) -> Response[RealityData]:
        url = self._service_url + "/reality-data/" + reality_data_id
        if itwin_id is not None:
            url += "?" + itwin_id
        response = self._session.post(url, reality_data_update.model_dump_json(by_alias=True),
                                      headers=self._get_header())
        pass

    def delete_reality_data(self, reality_data_id: str) -> Response[None]:
        response = self._session.delete(self._service_url + "/reality-data/" + reality_data_id,
                                        headers=self._get_header())
        pass

    def get_reality_data_write_access(self, reality_data_id: str, itwin_id: Optional[str] = None) -> Response[ContainerDetails]:
        pass

    def get_reality_data_read_access(self, reality_data_id: str, itwin_id: Optional[str] = None) -> Response[ContainerDetails]:
        pass

    def list_reality_data(self, reality_data_filter: Optional[RealityDataFilter] = None,
                          prefer: Optional[Prefer] = None) -> Response[RealityDatas]:
        pass
