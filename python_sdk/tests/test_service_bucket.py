import responses
import json
import os
from datetime import datetime

from reality_capture.service.service import RealityCaptureService


class FakeTokenFactory:
    @staticmethod
    def get_token() -> str:
        return "Bearer invalid"


class TestServiceBucket:
    # Utils
    def setup_method(self, _):
        self.ftf = FakeTokenFactory()
        self.rcs = RealityCaptureService(self.ftf)
        cf = os.path.dirname(os.path.abspath(__file__))
        self.data_folder = os.path.join(cf, "data")
        self.itwinId = "uuidIT"

    def teardown_method(self, test_method):
        pass

    @responses.activate
    def test_get_bucket_ill_formed(self):
        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/itwins/{self.itwinId}/bucket',
                      json={"bad": "response"},
                      status=400)
        response = self.rcs.get_bucket(self.itwinId)
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_get_bucket_401(self):
        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/itwins/{self.itwinId}/bucket',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        response = self.rcs.get_bucket(self.itwinId)
        assert response.is_error()
        assert response.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_get_bucket_200(self):
        with open(f"{self.data_folder}/bucket_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/itwins/{self.itwinId}/bucket',
                      json=payload, status=200)
        response = self.rcs.get_bucket(self.itwinId)
        assert not response.is_error()
        assert response.value.bucket.itwin_id == self.itwinId
