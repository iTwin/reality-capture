import responses
import json
import os

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

    def teardown_method(self, test_method):
        pass

    @responses.activate
    def test_get_files_ill_formed(self):
        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/files',
                      json={"bad": "response"},
                      status=400)
        response = self.rcs.get_service_files()
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_get_files_401(self):
        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/files',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        response = self.rcs.get_service_files()
        assert response.is_error()
        assert response.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_get_files_200(self):
        with open(f"{self.data_folder}/files_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/files',
                      json=payload, status=200)
        response = self.rcs.get_service_files()
        assert not response.is_error()
        assert len(response.value.files) == 2
        assert response.value.files[0].deprecated is None
        assert response.value.files[0].description == "preset file"
        assert response.value.files[1].description is None
        assert response.value.files[1].deprecated
