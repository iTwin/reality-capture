from reality_capture.service.job import Service
from reality_capture.service.service import RealityCaptureService
from urllib.parse import urlparse


class TestServiceBase:
    def test_service_base(self):
        class FakeTokenFactory:
            @staticmethod
            def get_token() -> str:
                return "Bearer invalid"

        ftf = FakeTokenFactory()
        rcs_qa = RealityCaptureService(ftf, env="qa", user_agent="Test")
        assert urlparse(rcs_qa._service_url).hostname == "qa-api.bentley.com"
        rcs_dev = RealityCaptureService(ftf, env="dev")
        assert urlparse(rcs_dev._service_url).hostname == "dev-api.bentley.com"

        r = rcs_qa.get_job("fake_job_qa", Service.MODELING)
        assert r.is_error()
        r = rcs_dev.get_job("fake_job_dev", Service.MODELING)
        assert r.is_error()
