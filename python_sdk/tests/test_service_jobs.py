import responses
import json
import os

from reality_capture.service.service import RealityCaptureService
from reality_capture.service.job import Service, Jobs


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
