import responses
import json
import os
from unittest.mock import patch
import requests

from reality_capture.service.service import RealityCaptureService
from reality_capture.service.job import Service, Jobs, JobCreate, JobType
import reality_capture.specifications.fill_image_properties as fip


class FakeTokenFactory:
    @staticmethod
    def get_token() -> str:
        return "Bearer invalid"


class TestServiceJobs:
    # Utils
    def setup_method(self, _):
        self.ftf = FakeTokenFactory()
        self.rcs = RealityCaptureService(self.ftf)
        cf = os.path.dirname(os.path.abspath(__file__))
        self.data_folder = os.path.join(cf, "data")

    def teardown_method(self, test_method):
        pass

    @responses.activate
    def test_get_jobs_ill_formed(self):
        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/jobs',
                      json={"bad": "response"},
                      status=400)
        response = self.rcs.get_jobs(Service.MODELING)
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_get_files_401(self):
        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/jobs',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        response = self.rcs.get_jobs(Service.MODELING)
        assert response.is_error()
        assert response.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_get_files_200(self):
        with open(f"{self.data_folder}/jobs_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/jobs?$filter=iTwinId%20eq%202c8e4988-eb9b-4e5f-a903-8c7c18f3030a&$top=2&continuationToken=MTRmZDkwOGYtNWEzOS00YzY3LWFmMGYtMGMxMWQxYWNkMDhl',
                      json=payload, status=200)
        response = self.rcs.get_jobs(Service.MODELING,
                                     filters="iTwinId eq 2c8e4988-eb9b-4e5f-a903-8c7c18f3030a", top=2,
                                     continuation_token="MTRmZDkwOGYtNWEzOS00YzY3LWFmMGYtMGMxMWQxYWNkMDhl")

        assert not response.is_error()
        assert len(response.value.jobs) == 2
        assert response.value.links.next.href == "https://api.bentley.com/reality-modeling/jobs?$filter=iTwinId%20eq%202c8e4988-eb9b-4e5f-a903-8c7c18f3030a&$top=2&continuationToken=MTRmZDkwOGYtNWEzOS00YzY3LWFmMGYtMGMxMWQxYWNkMDhl"
        assert response.value.get_continuation_token() == "MTRmZDkwOGYtNWEzOS00YzY3LWFmMGYtMGMxMWQxYWNkMDhl"

    def test_no_continuation_token(self):
        j = {
            "jobs": [],
            "_links": {
                "next": {
                    "href": "https://api.bentley.com/reality-modeling/jobs?$filter=iTwinId%20eq%202c8e4988-eb9b-4e5f-a903-8c7c18f3030a&$top=2"
                }
            }
        }
        jobs = Jobs(**j)
        assert jobs.get_continuation_token() is None
        j = {
            "jobs": []
        }
        jobs = Jobs(**j)
        assert jobs.get_continuation_token() is None

    def test_get_jobs_unsupported_service(self):
        with patch.object(self.rcs, "_get_correct_url", side_effect=NotImplementedError("unsupported")):
            response = self.rcs.get_jobs(Service.MODELING)
        assert response.is_error()
        assert response.status_code == 400
        assert "Could not get jobs" in response.error.error.message

    def _make_fip_job_create(self):
        fip_inputs = fip.FillImagePropertiesInputs(imageCollections=["fad5be03-30ee-4801-90e0-dee0349e5bce"])
        fip_outputs = [fip.FillImagePropertiesOutputsCreate.SCENE]
        fips = fip.FillImagePropertiesSpecificationsCreate(inputs=fip_inputs, outputs=fip_outputs)
        return JobCreate(name="TestJob", type=JobType.FILL_IMAGE_PROPERTIES, iTwinId="itid", specifications=fips)

    def test_submit_job_unsupported_service(self):
        jc = self._make_fip_job_create()
        with patch.object(self.rcs, "_get_correct_url", side_effect=NotImplementedError("unsupported")):
            response = self.rcs.submit_job(jc)
        assert response.is_error()
        assert response.status_code == 400
        assert "Could not submit job" in response.error.error.message

    def test_get_job_unsupported_service(self):
        with patch.object(self.rcs, "_get_correct_url", side_effect=NotImplementedError("unsupported")):
            response = self.rcs.get_job("some-job-id", Service.MODELING)
        assert response.is_error()
        assert response.status_code == 400
        assert "Could not get job" in response.error.error.message

    def test_get_job_messages_unsupported_service(self):
        with patch.object(self.rcs, "_get_correct_url", side_effect=NotImplementedError("unsupported")):
            response = self.rcs.get_job_messages("some-job-id", Service.MODELING)
        assert response.is_error()
        assert response.status_code == 400
        assert "Could not get job messages" in response.error.error.message

    def test_get_job_progress_unsupported_service(self):
        with patch.object(self.rcs, "_get_correct_url", side_effect=NotImplementedError("unsupported")):
            response = self.rcs.get_job_progress("some-job-id", Service.MODELING)
        assert response.is_error()
        assert response.status_code == 400
        assert "Could not get job progress" in response.error.error.message

    def test_cancel_job_unsupported_service(self):
        with patch.object(self.rcs, "_get_correct_url", side_effect=NotImplementedError("unsupported")):
            response = self.rcs.cancel_job("some-job-id", Service.MODELING)
        assert response.is_error()
        assert response.status_code == 400
        assert "Could not cancel job" in response.error.error.message

    @responses.activate
    def test_get_jobs_network_error(self):
        responses.add(responses.GET, "https://api.bentley.com/reality-modeling/jobs",
                      body=requests.exceptions.ConnectionError("network failure"))
        response = self.rcs.get_jobs(Service.MODELING)
        assert response.is_error()
        assert response.status_code == 503
        assert response.error.error.code == "NetworkError"

    @responses.activate
    def test_get_jobs_ill_formed_success(self):
        responses.add(responses.GET, "https://api.bentley.com/reality-modeling/jobs",
                      json={"unexpected": "no jobs key"},
                      status=200)
        response = self.rcs.get_jobs(Service.MODELING)
        assert response.is_error()
        assert response.status_code == 502
        assert response.error.error.code == "InvalidResponse"

    @responses.activate
    def test_get_jobs_non_json_error(self):
        responses.add(responses.GET, "https://api.bentley.com/reality-modeling/jobs",
                      body="Internal Server Error",
                      status=500)
        response = self.rcs.get_jobs(Service.MODELING)
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

