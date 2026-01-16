import responses
import json
import os
from datetime import datetime

from reality_capture.service.service import RealityCaptureService


class FakeTokenFactory:
    @staticmethod
    def get_token() -> str:
        return "Bearer invalid"


class TestServiceDetector:
    # Utils
    def setup_method(self, _):
        self.ftf = FakeTokenFactory()
        self.rcs = RealityCaptureService(self.ftf)
        cf = os.path.dirname(os.path.abspath(__file__))
        self.data_folder = os.path.join(cf, "data")

    def teardown_method(self, test_method):
        pass

    @responses.activate
    def test_get_detector_ill_formed(self):
        responses.add(responses.GET, f'https://api.bentley.com/reality-analysis/detectors/mydetector',
                      json={"bad": "response"},
                      status=400)
        response = self.rcs.get_detector("mydetector")
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_get_detector_401(self):
        responses.add(responses.GET, f'https://api.bentley.com/reality-analysis/detectors/mydetector',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        response = self.rcs.get_detector("mydetector")
        assert response.is_error()
        assert response.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_get_detector_200(self):
        with open(f"{self.data_folder}/detector_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET, f'https://api.bentley.com/reality-analysis/detectors/%40bentley%2Fbentley-city-a-s3d',
                      json=payload, status=200)
        response = self.rcs.get_detector("@bentley/bentley-city-a-s3d")
        assert not response.is_error()
        assert response.value.detector.name == "@bentley/bentley-city-a-s3d"

    @responses.activate
    def test_get_detectors_ill_formed(self):
        responses.add(responses.GET, f'https://api.bentley.com/reality-analysis/detectors',
                      json={"bad": "response"},
                      status=400)
        response = self.rcs.get_detectors()
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_get_detectors_401(self):
        responses.add(responses.GET, f'https://api.bentley.com/reality-analysis/detectors',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        response = self.rcs.get_detectors()
        assert response.is_error()
        assert response.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_get_detectors_200(self):
        with open(f"{self.data_folder}/detectors_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET, f'https://api.bentley.com/reality-analysis/detectors',
                      json=payload, status=200)
        response = self.rcs.get_detectors()
        assert not response.is_error()
        assert len(response.value.detectors) == 2