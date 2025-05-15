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
    def test_create_bucket_ill_formed(self):
        responses.add(responses.POST, f'https://api.bentley.com/reality-modeling/buckets?iTwinId={self.itwinId}',
                      json={"bad": "response"},
                      status=400)
        response = self.rcs.create_bucket(self.itwinId)
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_create_bucket_401(self):
        responses.add(responses.POST, f'https://api.bentley.com/reality-modeling/buckets?iTwinId={self.itwinId}',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        response = self.rcs.create_bucket(self.itwinId)
        assert response.is_error()
        assert response.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_create_bucket_201(self):
        with open(f"{self.data_folder}/bucket_create_201.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.POST,
                      f'https://api.bentley.com/reality-modeling/buckets?iTwinId={self.itwinId}',
                      json=payload, status=201)
        response = self.rcs.create_bucket(self.itwinId)
        assert not response.is_error()
        assert response.value.bucket.id == "uuidB"

    @responses.activate
    def test_get_default_bucket_ill_formed(self):
        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/buckets/default?iTwinId={self.itwinId}',
                      json={"bad": "response"},
                      status=400)
        response = self.rcs.get_bucket(self.itwinId)
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_get_default_bucket_401(self):
        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/buckets/default?iTwinId={self.itwinId}',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        response = self.rcs.get_bucket(self.itwinId)
        assert response.is_error()
        assert response.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_get_default_bucket_200(self):
        with open(f"{self.data_folder}/bucket_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-modeling/buckets/default?iTwinId={self.itwinId}',
                      json=payload, status=200)
        response = self.rcs.get_bucket(self.itwinId)
        assert not response.is_error()
        assert response.value.bucket.id == "uuidB"
        assert response.value.bucket.is_default

    @responses.activate
    def test_get_specific_bucket_200(self):
        with open(f"{self.data_folder}/bucket_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-modeling/buckets/uuidB?iTwinId={self.itwinId}',
                      json=payload, status=200)
        response = self.rcs.get_bucket(self.itwinId, "uuidB")
        assert not response.is_error()
        assert response.value.bucket.id == "uuidB"
        assert response.value.bucket.is_default

    @responses.activate
    def test_get_delete_bucket_ill_formed(self):
        responses.add(responses.DELETE,
                      f'https://api.bentley.com/reality-modeling/buckets/uuidB?iTwinId={self.itwinId}',
                      json={"bad": "response"},
                      status=400)
        response = self.rcs.delete_bucket(self.itwinId, "uuidB")
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_delete_bucket_401(self):
        responses.add(responses.DELETE, f'https://api.bentley.com/reality-modeling/buckets/uuidB?iTwinId={self.itwinId}',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        response = self.rcs.delete_bucket(self.itwinId, "uuidB")
        assert response.is_error()
        assert response.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_delete_bucket_204(self):
        responses.add(responses.DELETE,
                      f'https://api.bentley.com/reality-modeling/buckets/uuidB?iTwinId={self.itwinId}',
                      status=204)
        response = self.rcs.delete_bucket(self.itwinId, "uuidB")
        assert not response.is_error()
