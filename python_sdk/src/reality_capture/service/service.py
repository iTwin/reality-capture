import urllib.parse
import requests
import certifi

from reality_capture.service.bucket import BucketResponse
from reality_capture.service.detectors import (DetectorBase, DetectorsMinimalResponse, DetectorResponse, DetectorUpdate,
                                               DetectorVersionCreate, DetectorVersion, DetectorVersionWithLinks)
from reality_capture.service.files import Files
from reality_capture.service.response import Response
from reality_capture.service.job import JobCreate, Job, Progress, Messages, Service, Jobs
from reality_capture.service.reality_data import (RealityDataCreate, RealityData, RealityDataUpdate, ContainerDetails,
                                                  RealityDataFilter, Prefer, RealityDatas)
from reality_capture.service.error import DetailedErrorResponse, DetailedError
from reality_capture import __version__
from typing import Optional, Type
from pydantic import BaseModel, ValidationError
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
        self._session.verify = certifi.where()

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
        raise NotImplementedError("Other services not yet implemented")

    @staticmethod
    def _get_ill_formed_message(response, exception) -> str:
        try:
            r = response.json()
        except requests.exceptions.JSONDecodeError:
            r = response.text
        return f"Service response is ill-formed: {r}. Exception : {exception}"

    def _execute_request(self, method: str, url: str, headers: dict, success_model: Type[BaseModel] = None,
                         data_key: str = None, **kwargs) -> Response:
        try:
            response = self._session.request(method, url, headers=headers, **kwargs)
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            try:
                error_details = DetailedErrorResponse.model_validate(e.response.json())
                return Response(status_code=e.response.status_code, value=None, error=error_details)
            except (ValidationError, KeyError, requests.exceptions.JSONDecodeError):
                error = DetailedError(code="UnknownError", message=self._get_ill_formed_message(e.response, e))
                return Response(status_code=e.response.status_code, value=None,
                                error=DetailedErrorResponse(error=error))
        except requests.exceptions.RequestException as e:
            error = DetailedError(code="NetworkError", message=f"Network error : {e}")
            return Response(status_code=503, value=None, error=DetailedErrorResponse(error=error))

        try:
            if not success_model:
                return Response(status_code=response.status_code, value=None, error=None)
            json_data = response.json()
            if data_key:
                data_to_validate = json_data[data_key]
            else:
                data_to_validate = json_data
            validated_data = success_model.model_validate(data_to_validate)
            return Response(status_code=response.status_code, value=validated_data, error=None)
        except (ValidationError, KeyError, requests.exceptions.JSONDecodeError) as e:
            error = DetailedError(code="InvalidResponse", message=self._get_ill_formed_message(response, e))
            return Response(status_code=502, error=DetailedErrorResponse(error=error), value=None)

    def get_jobs(self, service: Service, filters: str,
                 top: int = None, continuation_token: str = "") -> Response[Jobs]:
        """
        Get list of jobs from a specific service.

        :param service: Service to target
        :param filters: The given filter is evaluated for each job and only job where the filter evaluates to true are returned. At least one filter criteria is required by the API. See `API documentation <https://developer.bentley.com/apis/reality-modeling/operations/jobs-get-all/#request-parameters>`_ to know more.
        :param top: The number of jobs to get in each page. Min 2, max 1000.
        :param continuation_token: Parameter that enables continuing to the next page of the previous paged query. This must be passed exactly as it is in the response body's _links.next property.
        """
        try:
            url = self._get_correct_url(service) + "jobs"
        except (NotImplementedError, ValidationError) as e:
            detailed_error = DetailedError(code="UnknownError", message=f"Could not get jobs, bad request : "
                                                                        f"{e}")
            return Response(status_code=400, value=None, error=DetailedErrorResponse(error=detailed_error))

        params = {"$filter": filters}
        if top is not None:
            params["$top"] = max(min(top, 1000), 2)
        if continuation_token:
            params["continuationToken"] = continuation_token

        return self._execute_request(method="GET", url=url, headers=self._get_header_v2(), success_model=Jobs,
                                     params=params)

    def submit_job(self, job: JobCreate) -> Response[Job]:
        """
        Submit a job to the service. The job will be created and submitted at once.

        :param job: JobCreate information to use for the job.
        :return: A Response[Job] containing either the Job created or the error from the service.
        """
        try:
            url = self._get_correct_url(job.get_appropriate_service()) + "jobs"
            json_dump = job.model_dump_json(by_alias=True)
        except (NotImplementedError, ValidationError) as e:
            detailed_error = DetailedError(code="UnknownError", message=f"Could not submit job, bad request : "
                                                                        f"{e}")
            return Response(status_code=400, value=None, error=DetailedErrorResponse(error=detailed_error))

        return self._execute_request(method="POST", url=url, headers=self._get_header_v2(), success_model=Job,
                                     data_key="job", data=json_dump)

    def get_job(self, job_id: str, service: Service) -> Response[Job]:
        """
        Retrieve the complete Job details from the service using the job id.

        :param job_id: Id of the job to retrieve.
        :param service: Service to target.
        :return: A Response[Job] containing either the Job information or the error from the service.
        """
        try:
            url = self._get_correct_url(service) + "jobs/" + job_id
        except (NotImplementedError, ValidationError) as e:
            detailed_error = DetailedError(code="UnknownError", message=f"Could not get job, bad request : "
                                                                        f"{e}")
            return Response(status_code=400, value=None, error=DetailedErrorResponse(error=detailed_error))

        return self._execute_request(method="GET", url=url, headers=self._get_header_v2(),
                                     success_model=Job, data_key="job")

    def get_job_messages(self, job_id: str, service: Service) -> Response[Messages]:
        """
        Retrieve the complete Job details from the service using the job id.

        :param job_id: Id of the job related to the messages to retrieve.
        :param service: Service to target.
        :return: A Response[Messages] containing either the messages for the job or the error from the service.
        """
        try:
            url = self._get_correct_url(service) + "jobs/" + job_id + "/messages"
        except (NotImplementedError, ValidationError) as e:
            detailed_error = DetailedError(code="UnknownError", message=f"Could not get job messages, bad request : "
                                                                        f"{e}")
            return Response(status_code=400, value=None, error=DetailedErrorResponse(error=detailed_error))

        return self._execute_request(method="GET", url=url, headers=self._get_header_v2(),
                                     success_model=Messages, data_key="messages")

    def get_job_progress(self, job_id: str, service: Service) -> Response[Progress]:
        """
        Retrieve progress information from the service using the job id.

        :param job_id: Id of the job to monitor.
        :param service: Service to target.
        :return: A Response[Progress] containing either the job progress or the error from the service.
        """

        try:
            url = self._get_correct_url(service) + "jobs/" + job_id + "/progress"
        except (NotImplementedError, ValidationError) as e:
            detailed_error = DetailedError(code="UnknownError", message=f"Could not get job progress, bad request : "
                                                                        f"{e}")
            return Response(status_code=400, value=None, error=DetailedErrorResponse(error=detailed_error))

        return self._execute_request(method="GET", url=url, headers=self._get_header_v2(),
                                     success_model=Progress, data_key="progress")

    def cancel_job(self, job_id: str, service: Service) -> Response[Job]:
        """
        Cancel the job using the job id. Calling this method on a non-running job will yield an error.

        :param job_id: Id of the job to cancel.
        :param service: Service to target.
        :return: A Response[Job] containing either the job information or the error from the service.
        """

        try:
            url = self._get_correct_url(service) + "jobs/" + job_id
        except (NotImplementedError, ValidationError) as e:
            detailed_error = DetailedError(code="UnknownError", message=f"Could not cancel job, bad request : "
                                                                        f"{e}")
            return Response(status_code=400, value=None, error=DetailedErrorResponse(error=detailed_error))

        return self._execute_request(method="DELETE", url=url, headers=self._get_header_v2(),
                                     success_model=Job, data_key="job")

    def get_bucket(self, itwin_id: str) -> Response[BucketResponse]:
        """
        Retrieve a bucket information for a given iTwin

        :param itwin_id: iTwin id for finding the bucket
        :return: A Response[BucketResponse] containing either the bucket information or the error from the service.
        """

        return self._execute_request(method="GET",
                                     url=self._get_correct_url(Service.MODELING) + f"itwins/{itwin_id}/bucket",
                                     headers=self._get_header_v2(),
                                     success_model=BucketResponse)

    def get_service_files(self) -> Response[Files]:
        """
        Retrieve the list of available files from the service.

        :return: A Response[Files] containing either the files information or the error from the service.
        """

        return self._execute_request(method="GET", url=self._get_correct_url(Service.MODELING) + f"files",
                                     headers=self._get_header_v2(),
                                     success_model=Files)

    def get_detectors(self, detectors_filter: Optional[str] = None) -> Response[DetectorsMinimalResponse]:
        """
        Retrieve all available detectors.

        :param detectors_filter: The $filter query option requests a specific set of detectors.
                       Properties supported for filtering: labels, exports.
                       Supported operators: and, or, not, in.
                       Example: "exports in ('Polygons', 'Lines') and labels in ('crack')"
        :return: A Response[DetectorsMinimalResponse] containing either the detector list or the error from the service.
        """
        url = self._get_correct_url(Service.ANALYSIS) + "detectors"
        params = {}
        if detectors_filter:
            params["$filter"] = detectors_filter

        encoded_params = urlencode(params)
        if encoded_params:
            url = f"{url}?{encoded_params}"

        return self._execute_request(method="GET",
                                     url=url,
                                     headers=self._get_header_v2(),
                                     success_model=DetectorsMinimalResponse)

    def get_detector(self, detector_name: str) -> Response[DetectorResponse]:
        """
        Retrieve details of a detector.
    
        :return: A Response[DetectorResponse] containing either the detector details or the error from the service.
        """

        try:
            url_encoded_name = urllib.parse.quote(detector_name, safe="")
            url = self._get_correct_url(Service.ANALYSIS) + f"detectors/{url_encoded_name}"
        except (NotImplementedError, ValidationError) as e:
            detailed_error = DetailedError(code="UnknownError", message=f"Could not get detector, bad request : "
                                                                        f"{e}")
            return Response(status_code=400, value=None, error=DetailedErrorResponse(error=detailed_error))

        return self._execute_request(method="GET", url=url, headers=self._get_header_v2(),
                                     success_model=DetectorResponse)

    def create_detector(self, detector_create: DetectorBase) -> Response[DetectorResponse]:
        """
        Create a detector.

        :param detector_create: DetectorBase information to create the detector.
        :return: A Response[DetectorResponse] containing either the created detector details or the error from the service.
        """
        try:
            url = self._get_correct_url(Service.ANALYSIS) + f"detectors"
            json_dump = detector_create.model_dump_json(by_alias=True)
        except (NotImplementedError, ValidationError) as e:
            detailed_error = DetailedError(code="UnknownError", message=f"Could not create detector, bad request : "
                                                                        f"{e}")
            return Response(status_code=400, value=None, error=DetailedErrorResponse(error=detailed_error))

        return self._execute_request(method="POST", url=url, headers=self._get_header_v2(),
                                     success_model=DetectorResponse, data=json_dump)

    def update_detector(self, detector_name: str, detector_update: DetectorUpdate) -> Response[DetectorResponse]:
        """
        Update a detector.

        :param detector_name: name of the detector.
        :param detector_update: DetectorUpdate information to update the detector.
        :return: A Response[DetectorResponse] containing either the updated detector details or the error from the service.
        """
        try:
            url_encoded_name = urllib.parse.quote(detector_name, safe="")
            url = self._get_correct_url(Service.ANALYSIS) + f"detectors/{url_encoded_name}"
            json_dump = detector_update.model_dump_json(by_alias=True)
        except (NotImplementedError, ValidationError) as e:
            detailed_error = DetailedError(code="UnknownError", message=f"Could not update detector, bad request : "
                                                                        f"{e}")
            return Response(status_code=400, value=None, error=DetailedErrorResponse(error=detailed_error))

        return self._execute_request(method="PATCH", url=url, headers=self._get_header_v2(),
                                     success_model=DetectorResponse, data=json_dump)

    def delete_detector(self, detector_name: str) -> Response[None]:
        """
        Delete a detector.


        :param detector_name: Name of the detector to delete.
        :return: A Response[None] containing either nothing if successful or the error from the service.
        try:
            url_encoded_name = urllib.parse.quote(detector_name, safe="")
            url = self._get_correct_url(Service.ANALYSIS) + f"detectors/{url_encoded_name}"
        except (NotImplementedError, ValidationError) as e:
            detailed_error = DetailedError(code="UnknownError", message=f"Could not delete detector, bad request : "
                                                                        f"{e}")
            return Response(status_code=400, value=None, error=DetailedErrorResponse(error=detailed_error))

        return self._execute_request(method="DELETE", url=url, headers=self._get_header_v2())

    def create_detector_version(self, detector_name: str,
                               version_create: DetectorVersionCreate) -> Response[DetectorVersionWithLinks]:
        """
        Create a new version for the specified detector.

        :param detector_name: Name of the detector.
        :param version_create: DetectorVersionCreate information to create the version.
        :return: A Response[DetectorVersion] containing either the created version or the error from the service.
        """
        try:
            url_encoded_name = urllib.parse.quote(detector_name, safe="")
            url = (self._get_correct_url(Service.ANALYSIS) + f"detectors/{url_encoded_name}/versions")
            json_dump = version_create.model_dump_json(by_alias=True)
        except (NotImplementedError, ValidationError) as e:
            detailed_error = DetailedError(code="UnknownError",
                                           message=f"Could not create detector version, bad request : "
                                                   f"{e}")
            return Response(status_code=400, value=None, error=DetailedErrorResponse(error=detailed_error))

        return self._execute_request(method="POST", url=url, headers=self._get_header_v2(), data=json_dump,
                                     success_model=DetectorVersionWithLinks)

    def delete_detector_version(self, detector_name: str, detector_version: str) -> Response[None]:
        """
        Delete the specified version of a detector.

        :param detector_name: Name of the detector.
        :param detector_version: Version of the detector to delete.
        :return: A Response[DetectorVersion] containing either nothing or the error from the service.
        """
        try:
            url_encoded_name = urllib.parse.quote(detector_name, safe="")
            url_encoded_version = urllib.parse.quote(detector_version, safe="")
            url = (self._get_correct_url(Service.ANALYSIS)
                   + f"detectors/{url_encoded_name}/versions/{url_encoded_version}")
        except (NotImplementedError, ValidationError) as e:
            detailed_error = DetailedError(code="UnknownError",
                                           message=f"Could not delete detector version, bad request : "
                                                   f"{e}")
            return Response(status_code=400, value=None, error=DetailedErrorResponse(error=detailed_error))

        return self._execute_request(method="DELETE", url=url, headers=self._get_header_v2())

    def publish_detector_version(self, detector_name: str, version_number: str) -> Response[None]:
        """
        Publish the specified detector version.

        :param detector_name: Name of the detector.
        :param version_number: Name of the version.
        :return: A Response[DetectorVersion] containing either nothing or the error from the service.
        """
        try:
            url_encoded_name = urllib.parse.quote(detector_name, safe="")
            url_encoded_version = urllib.parse.quote(version_number, safe="")
            url = (self._get_correct_url(Service.ANALYSIS)
                   + f"detectors/{url_encoded_name}/versions/{url_encoded_version}/publish")
        except (NotImplementedError, ValidationError) as e:
            detailed_error = DetailedError(code="UnknownError",
                                           message=f"Could not publish detector version, bad request : "
                                                   f"{e}")
            return Response(status_code=400, value=None, error=DetailedErrorResponse(error=detailed_error))

        return self._execute_request(method="POST", url=url, headers=self._get_header_v2())

    def unpublish_detector_version(self, detector_name: str, version_number: str) -> Response[None]:
        """
        Unpublish the specified detector version.

        :param detector_name: Name of the detector.
        :param version_number: Name of the version.
        :return: A Response[DetectorVersion] containing either nothing or the error from the service.
        """
        try:
            url_encoded_name = urllib.parse.quote(detector_name, safe="")
            url_encoded_version = urllib.parse.quote(version_number, safe="")
            url = (self._get_correct_url(Service.ANALYSIS)
                   + f"detectors/{url_encoded_name}/versions/{url_encoded_version}/unpublish")
        except (NotImplementedError, ValidationError) as e:
            detailed_error = DetailedError(code="UnknownError",
                                           message=f"Could not unpublish detector version, bad request : "
                                                   f"{e}")
            return Response(status_code=400, value=None, error=DetailedErrorResponse(error=detailed_error))

        return self._execute_request(method="POST", url=url, headers=self._get_header_v2())

    def complete_detector_version_upload(self, detector_name: str, version_number: str) -> Response[None]:
        """
        Complete the upload of the specified detector version.

        :param detector_name: Name of the detector.
        :param version_number: Name of the version.
        :return: A Response[DetectorVersion] containing either nothing or the error from the service.
        """
        try:
            url_encoded_name = urllib.parse.quote(detector_name, safe="")
            url_encoded_version = urllib.parse.quote(version_number, safe="")
            url = (self._get_correct_url(Service.ANALYSIS)
                   + f"detectors/{url_encoded_name}/versions/{url_encoded_version}/complete")
        except (NotImplementedError, ValidationError) as e:
            detailed_error = DetailedError(code="UnknownError",
                                           message=f"Could not complete the upload of the detector version, bad request : "
                                                   f"{e}")
            return Response(status_code=400, value=None, error=DetailedErrorResponse(error=detailed_error))

        return self._execute_request(method="POST", url=url, headers=self._get_header_v2())

    def create_reality_data(self, reality_data: RealityDataCreate) -> Response[RealityData]:
        """
        Create a new Reality Data.

        :param reality_data: Reality Data information to use.
        :return: A Response[RealityData] containing either the reality data information or the error from the service.
        """

        try:
            json_dump = reality_data.model_dump_json(by_alias=True, exclude_none=True)
        except (NotImplementedError, ValidationError) as e:
            detailed_error = DetailedError(code="UnknownError", message=f"Could not create reality data, bad request : "
                                                                        f"{e}")
            return Response(status_code=400, value=None, error=DetailedErrorResponse(error=detailed_error))

        return self._execute_request(method="POST", url=self._get_reality_management_rd_url(),
                                     success_model=RealityData, data=json_dump, data_key="realityData",
                                     headers=self._get_header_v1())

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
        return self._execute_request(method="GET", url=url, success_model=RealityData, data_key="realityData",
                                     headers=self._get_header_v1())

    def update_reality_data(self, reality_data_update: RealityDataUpdate,
                            reality_data_id: str) -> Response[RealityData]:
        """
        Update Reality Data information with new information based on its.

        :param reality_data_update: Reality Data information to overwrite.
        :param reality_data_id: Id of the existing reality data.
        :return: A Response[RealityData] containing either the reality data information or the error from the service.
        """

        try:
            json_dump = reality_data_update.model_dump_json(by_alias=True, exclude_none=True)
        except (NotImplementedError, ValidationError) as e:
            detailed_error = DetailedError(code="UnknownError", message=f"Could not update reality data, bad request : "
                                                                        f"{e}")
            return Response(status_code=400, value=None, error=DetailedErrorResponse(error=detailed_error))

        return self._execute_request(method="PATCH", url=self._get_reality_management_rd_url() + reality_data_id,
                                     success_model=RealityData, data=json_dump, data_key="realityData",
                                     headers=self._get_header_v1())

    def delete_reality_data(self, reality_data_id: str) -> Response[None]:
        """
        Delete Reality Data and its associated content based on its id.

        :param reality_data_id: Id of the existing reality data.
        :return: A Response[RealityData] containing either nothing if successful or the error from the service.
        """

        return self._execute_request(method="DELETE", url=self._get_reality_management_rd_url() + reality_data_id,
                                     headers=self._get_header_v1())

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

        return self._execute_request(method="GET", url=url, headers=self._get_header_v1(),
                                     success_model=ContainerDetails)

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

        return self._execute_request(method="GET", url=url, headers=self._get_header_v1(),
                                     success_model=ContainerDetails)

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

        return self._execute_request(method="GET", url=url, headers=header, success_model=RealityDatas)

    def move_reality_data(self, reality_data_id: str, itwin_id: str) -> Response[None]:
        """
        Move a RealityData to a different iTwin.

        :param reality_data_id The id of the RealityData to move.
        :param itwin_id The id of the iTwin to move the RealityData to.
        :return: A Response[bool] containing either true if successful or false if not.
        """

        return self._execute_request(method="PATCH",
                                     url=self._get_reality_management_rd_url() + reality_data_id + "/move",
                                     headers=self._get_header_v1(), success_model=None,
                                     json={"iTwinId": itwin_id})
