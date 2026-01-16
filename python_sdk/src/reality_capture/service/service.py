import urllib.parse
import requests

from reality_capture.service.bucket import BucketResponse
from reality_capture.service.detectors import DetectorsMinimalResponse, DetectorResponse
from reality_capture.service.estimation import CostEstimationCreate, CostEstimation
from reality_capture.service.files import Files
from reality_capture.service.response import Response
from reality_capture.service.job import JobCreate, Job, Progress, Messages, Service, Jobs
from reality_capture.service.reality_data import (RealityDataCreate, RealityData, RealityDataUpdate, ContainerDetails,
                                                  RealityDataFilter, Prefer, RealityDatas)
from reality_capture.service.error import DetailedErrorResponse, DetailedError
from reality_capture import __version__
from typing import Optional
from pydantic import ValidationError
from urllib.parse import urlencode


class RealityCaptureService:
    """
    Service handling communication with Reality Capture APIs
    """

    def __init__(self, token_factory, **kwargs) -> None:
        """
        Constructor method

        :param token_factory: An object that implements a ``get_token() -> str`` method.
        :type token_factory: Object
        :param \**kwargs: See below.

        :Keyword Arguments:
            * *user_agent* (``str``) --
              Additional user agent string

        """
        self._token_factory = token_factory
        self._session = requests.Session()

        add_ua = ""
        if "user_agent" in kwargs.keys() and len(kwargs["user_agent"]) > 0:
            add_ua = " " + kwargs["user_agent"]

        self._header = {
            "Authorization": None,
            "User-Agent": f"Reality Capture Python SDK/{__version__}{add_ua}",
            "Content-type": "application/json",
            "Accept": "application/vnd.bentley.itwin-platform.v1+json",
        }

        env = None
        if "env" in kwargs.keys():
            env = kwargs["env"]
        if env == "qa":
            self._service_url = "https://qa-api.bentley.com/"
        elif env == "dev":
            self._service_url = "https://dev-api.bentley.com/"
        else:
            self._service_url = "https://api.bentley.com/"

    def _get_header(self, version) -> dict:
        self._header["Authorization"] = self._token_factory.get_token()
        self._header["Accept"] = f"application/vnd.bentley.itwin-platform.{version}+json"
        return self._header

    def _get_header_v1(self) -> dict:
        return self._get_header("v1")

    def _get_header_v2(self) -> dict:
        return self._get_header("v2")

    def _get_reality_management_rd_url(self) -> str:
        return self._service_url + "reality-management/reality-data/"

    def _get_modeling_url(self) -> str:
        return self._service_url + "reality-modeling/"

    def _get_analysis_url(self) -> str:
        return self._service_url + "reality-analysis/"

    def _get_correct_url(self, service: Service) -> str:
        if service == Service.MODELING:
            return self._get_modeling_url()
        if service == Service.ANALYSIS:
            return self._get_analysis_url()
        raise NotImplemented("Other services not yet implemented")

    @staticmethod
    def _get_ill_formed_message(response, exception) -> str:
        r = response.json()
        return f"Service response is ill-formed: {r}. Exception : {exception}"

    def get_jobs(self, service: Service, filters: str = "",
                 top: int = None, continuation_token: str = "") -> Response[Jobs]:
        """
        Get list of jobs from a specific service.

        :param service: Service to target
        :param filters: The given filter is evaluated for each job and only job where the filter evaluates to true are returned. See `API documentation <https://developer.bentley.com/apis/reality-modeling/operations/jobs-get-all/#request-parameters>`_ to know more.
        :param top: The number of jobs to get in each page. Min 2, max 1000.
        :param continuation_token: Parameter that enables continuing to the next page of the previous paged query. This must be passed exactly as it is in the response body's _links.next property.
        """
        url = self._get_correct_url(service)+ "jobs"
        params = {}
        if filters:
            params["$filter"] = filters
        if top is not None:
            params["$top"] = max(min(top, 1000), 2)
        if continuation_token:
            params["continuationToken"] = continuation_token
        response = self._session.get(url, params=params, headers=self._get_header_v2())
        try:
            if response.ok:
                return Response(status_code=response.status_code, value=Jobs.model_validate(response.json()),
                                error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except (ValidationError, KeyError) as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)


    def submit_job(self, job: JobCreate) -> Response[Job]:
        """
        Submit a job to the service. The job will be created and submitted at once.

        :param job: JobCreate information to use for the job.
        :return: A Response[Job] containing either the Job created or the error from the service.
        """
        url = self._get_correct_url(job.get_appropriate_service())
        response = self._session.post(url + "/jobs", job.model_dump_json(by_alias=True), headers=self._get_header_v2())
        try:
            if response.ok:
                return Response(status_code=response.status_code, value=Job.model_validate(response.json()["job"]),
                                error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except (ValidationError, KeyError) as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

    def get_job(self, job_id: str, service: Service) -> Response[Job]:
        """
        Retrieve the complete Job details from the service using the job id.

        :param job_id: Id of the job to retrieve.
        :param service: Service to target.
        :return: A Response[Job] containing either the Job information or the error from the service.
        """
        url = self._get_correct_url(service)
        response = self._session.get(url + "/jobs/" + job_id, headers=self._get_header_v2())
        try:
            if response.ok:
                return Response(status_code=response.status_code, value=Job.model_validate(response.json()["job"]),
                                error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except (ValidationError, KeyError) as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

    def get_job_messages(self, job_id: str, service: Service) -> Response[Messages]:
        """
        Retrieve the complete Job details from the service using the job id.

        :param job_id: Id of the job related to the messages to retrieve.
        :param service: Service to target.
        :return: A Response[Messages] containing either the messages for the job or the error from the service.
        """
        url = self._get_correct_url(service)
        response = self._session.get(url + "/jobs/" + job_id + "/messages", headers=self._get_header_v2())
        try:
            if response.ok:
                return Response(status_code=response.status_code,
                                value=Messages.model_validate(response.json()["messages"]),
                                error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except (ValidationError, KeyError) as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

    def get_job_progress(self, job_id: str, service: Service) -> Response[Progress]:
        """
        Retrieve progress information from the service using the job id.

        :param job_id: Id of the job to monitor.
        :param service: Service to target.
        :return: A Response[Progress] containing either the job progress or the error from the service.
        """
        url = self._get_correct_url(service)
        response = self._session.get(url + "/jobs/" + job_id + "/progress", headers=self._get_header_v2())
        try:
            if response.ok:
                return Response(status_code=response.status_code,
                                value=Progress.model_validate(response.json()["progress"]), error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except (ValidationError, KeyError) as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

    def cancel_job(self, job_id: str, service: Service) -> Response[Job]:
        """
        Cancel the job using the job id. Calling this method on a non-running job will yield an error.

        :param job_id: Id of the job to cancel.
        :param service: Service to target.
        :return: A Response[Job] containing either the job information or the error from the service.
        """
        url = self._get_correct_url(service)
        response = self._session.delete(url + "/jobs/" + job_id, headers=self._get_header_v2())
        try:
            if response.ok:
                return Response(status_code=response.status_code,
                                value=Job.model_validate(response.json()["job"]), error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except (ValidationError, KeyError) as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

    def estimate_cost(self, estimation_create: CostEstimationCreate) -> Response[CostEstimation]:
        """
        Estimate the processing cost of a job.

        :param estimation_create: Estimation parameters
        :return: A Response[Estimation] containing either the cost estimation or the error from the service.
        """
        url = self._get_correct_url(estimation_create.get_appropriate_service())
        response = self._session.post(url + "/costs", estimation_create.model_dump_json(by_alias=True),
                                      headers=self._get_header_v2())
        try:
            if response.ok:
                return Response(status_code=response.status_code,
                                value=CostEstimation.model_validate(response.json()["costEstimation"]), error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except (ValidationError, KeyError) as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

    def get_bucket(self, itwin_id: str) -> Response[BucketResponse]:
        """
        Retrieve a bucket information for a given iTwin

        :param itwin_id: iTwin id for finding the bucket
        :return: A Response[BucketResponse] containing either the bucket information or the error from the service.
        """
        response = self._session.get(self._get_correct_url(Service.MODELING) + f"itwins/{itwin_id}/bucket",
                                     headers=self._get_header_v2())
        try:
            if response.ok:
                return Response(status_code=response.status_code,
                                value=BucketResponse.model_validate(response.json()), error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except (ValidationError, KeyError) as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

    def get_service_files(self) -> Response[Files]:
        """
        Retrieve the list of available files from the service.

        :return: A Response[Files] containing either the files information or the error from the service.
        """
        response = self._session.get(self._get_correct_url(Service.MODELING) + f"files", headers=self._get_header_v2())
        try:
            if response.ok:
                return Response(status_code=response.status_code,
                                value=Files.model_validate(response.json()), error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except (ValidationError, KeyError) as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

    def get_detectors(self) -> Response[DetectorsMinimalResponse]:
        """
        Retrieve all available detectors.
    
        :return: A Response[DetectorsMinimalResponse] containing either the detector list or the error from the service.
        """
        response = self._session.get(self._get_correct_url(Service.ANALYSIS) + f"detectors",
                                     headers=self._get_header_v2())
        try:
            if response.ok:
                return Response(status_code=response.status_code,
                                value=DetectorsMinimalResponse.model_validate(response.json()), error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except (ValidationError, KeyError) as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

    def get_detector(self, detector_name: str) -> Response[DetectorResponse]:
        """
        Retrieve details of a detector.
    
        :return: A Response[DetectorResponse] containing either the detector details or the error from the service.
        """
        response = self._session.get(self._get_correct_url(Service.ANALYSIS) + f"detectors/{detector_name}",
                                     headers=self._get_header_v2())
        try:
            if response.ok:
                return Response(status_code=response.status_code,
                                value=DetectorResponse.model_validate(response.json()), error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except (ValidationError, KeyError) as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

    def create_reality_data(self, reality_data: RealityDataCreate) -> Response[RealityData]:
        """
        Create a new Reality Data.

        :param reality_data: Reality Data information to use.
        :return: A Response[RealityData] containing either the reality data information or the error from the service.
        """
        response = self._session.post(self._get_reality_management_rd_url(),
                                      reality_data.model_dump_json(by_alias=True, exclude_none=True),
                                      headers=self._get_header_v1())
        try:
            if response.ok:
                return Response(status_code=response.status_code,
                                value=RealityData.model_validate(response.json()["realityData"]), error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except (ValidationError, KeyError) as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

    def get_reality_data(self, reality_data_id: str, itwin_id: Optional[str] = None) -> Response[RealityData]:
        """
        Retrieve Reality Data information based on its id and possible iTwin id.

        :param reality_data_id: Id of the existing reality data.
        :param itwin_id: Optional iTwin id for finding the reality data.
        :return: A Response[RealityData] containing either the reality data information or the error from the service.
        """
        url = self._get_reality_management_rd_url() + reality_data_id
        if itwin_id is not None:
            url += "?iTwinId=" + itwin_id
        response = self._session.get(url, headers=self._get_header_v1())
        try:
            if response.ok:
                return Response(status_code=response.status_code,
                                value=RealityData.model_validate(response.json()["realityData"]), error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except (ValidationError, KeyError) as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

    def update_reality_data(self, reality_data_update: RealityDataUpdate,
                            reality_data_id: str) -> Response[RealityData]:
        """
        Update Reality Data information with new information based on its.

        :param reality_data_update: Reality Data information to overwrite.
        :param reality_data_id: Id of the existing reality data.
        :return: A Response[RealityData] containing either the reality data information or the error from the service.
        """
        url = self._get_reality_management_rd_url() + reality_data_id
        response = self._session.patch(url, reality_data_update.model_dump_json(by_alias=True, exclude_none=True),
                                       headers=self._get_header_v1())
        try:
            if response.ok:
                return Response(status_code=response.status_code,
                                value=RealityData.model_validate(response.json()["realityData"]), error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except (ValidationError, KeyError) as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

    def delete_reality_data(self, reality_data_id: str) -> Response[None]:
        """
        Delete Reality Data and its associated content based on its id.

        :param reality_data_id: Id of the existing reality data.
        :return: A Response[RealityData] containing either nothing if successful or the error from the service.
        """
        url = self._get_reality_management_rd_url() + reality_data_id
        response = self._session.delete(url, headers=self._get_header_v1())
        try:
            if response.ok:
                return Response(status_code=response.status_code,
                                value=None, error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except ValidationError as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

    def get_reality_data_write_access(self, reality_data_id: str,
                                      itwin_id: Optional[str] = None) -> Response[ContainerDetails]:
        """
        Get write access to a specific Reality Data.

        :param reality_data_id: Id of the existing reality data.
        :param itwin_id: Optional iTwin id for finding the reality data.
        :return: A Response[ContainerDetails] containing either the container details or the error from the service.
        """
        url = self._get_reality_management_rd_url() + reality_data_id + "/writeaccess"
        if itwin_id is not None:
            url += "?iTwinId=" + itwin_id
        response = self._session.get(url, headers=self._get_header_v1())
        try:
            if response.ok:
                return Response(status_code=response.status_code,
                                value=ContainerDetails.model_validate(response.json()), error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except ValidationError as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

    def get_reality_data_read_access(self, reality_data_id: str,
                                     itwin_id: Optional[str] = None) -> Response[ContainerDetails]:
        """
        Get read access to a specific Reality Data.

        :param reality_data_id: Id of the existing reality data.
        :param itwin_id: Optional iTwin id for finding the reality data.
        :return: A Response[ContainerDetails] containing either the container details or the error from the service.
        """
        url = self._get_reality_management_rd_url() + reality_data_id + "/readaccess"
        if itwin_id is not None:
            url += "?iTwinId=" + itwin_id
        response = self._session.get(url, headers=self._get_header_v1())
        try:
            if response.ok:
                return Response(status_code=response.status_code,
                                value=ContainerDetails.model_validate(response.json()), error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except ValidationError as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

    def list_reality_data(self, reality_data_filter: Optional[RealityDataFilter] = None,
                          prefer: Optional[Prefer] = None) -> Response[RealityDatas]:
        """
        List reality data that you can access with optional filtering options.

        :param reality_data_filter: Optional filtering information.
        :param prefer: Preferred representation of Reality Data in the response.
        :return: A Response[ContainerDetails] containing either a list of reality data or the error from the service.
        """
        url = self._get_reality_management_rd_url()
        if reality_data_filter is not None:
            params = reality_data_filter.as_dict_for_service_call()
            encoded_params = urlencode(params)
            url = f"{url}?{encoded_params}"
        header = self._get_header_v1()
        header["Prefer"] = "return=minimal"
        if prefer == Prefer.REPRESENTATION:
            header["Prefer"] = "return=representation"

        response = self._session.get(url, headers=header)

        try:
            if response.ok:
                return Response(status_code=response.status_code,
                                value=RealityDatas.model_validate(response.json()), error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except ValidationError as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

    def move_reality_data(self, reality_data_id: str, itwin_id: str) -> Response[None]:
        """
        Move a RealityData to a different iTwin.

        :param reality_data_id The id of the RealityData to move.
        :param itwin_id The id of the iTwin to move the RealityData to.
        :return: A Response[bool] containing either true if successful or false if not.
        """
        url = self._get_reality_management_rd_url() + reality_data_id + "/move"
        response = self._session.patch(url, {"iTwinId": itwin_id}, headers=self._get_header_v1())
        try:
            if response.ok:
                return Response(status_code=response.status_code,
                                value=None, error=None)
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse.model_validate(response.json()), value=None)
        except ValidationError as exception:
            error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(response, exception))
            return Response(status_code=response.status_code,
                            error=DetailedErrorResponse(error=error), value=None)

