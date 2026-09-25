from reality_capture.service.job import Service
from reality_capture.service.service import RealityCaptureService
from urllib.parse import urlparse
from unittest.mock import MagicMock
import pytest


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
        r = rcs_dev.get_job("fake_job_dev", Service.CONVERSION)
        assert r.is_error()

    def test_get_correct_url_unsupported_service_raises(self):
        rcs = RealityCaptureService(None)
        unsupported = MagicMock(name="UnsupportedService")
        with pytest.raises(NotImplementedError):
            rcs._get_correct_url(unsupported)

    @pytest.mark.parametrize(
        ("proxy", "expected"),
        [
            ("proxy.example.com:8080", "http://user:password@proxy.example.com:8080"),
            ("http://proxy.example.com:8080", "http://user:password@proxy.example.com:8080"),
            ("https://proxy.example.com:8443/", "https://user:password@proxy.example.com:8443"),
            ("http://[2001:db8::1]:8080", "http://user:password@[2001:db8::1]:8080"),
        ],
    )
    def test_set_proxy_normalizes_proxy_url(self, proxy, expected):
        rcs = RealityCaptureService(None)

        rcs.set_proxy("user", "password", proxy)

        assert rcs._proxies == {"https": expected}

    def test_set_proxy_encodes_credentials(self):
        rcs = RealityCaptureService(None)

        rcs.set_proxy("domain\\user@example.com", "p@ss:w/rd#%", "proxy.example.com:8080")

        assert rcs._proxies == {
            "https": "http://domain%5Cuser%40example.com:p%40ss%3Aw%2Frd%23%25@proxy.example.com:8080"
        }

    @pytest.mark.parametrize(
        "proxy",
        [
            "",
            "ftp://proxy.example.com:21",
            "http://proxy.example.com:not-a-port",
            "http://proxy.example.com:8080/path",
            "http://proxy.example.com:8080?option=value",
            "http://proxy.example.com:8080#fragment",
        ],
    )
    def test_set_proxy_rejects_invalid_proxy_url(self, proxy):
        rcs = RealityCaptureService(None)

        with pytest.raises(ValueError):
            rcs.set_proxy("user", "password", proxy)

        assert rcs._proxies == {}

    def test_unset_proxy_clears_existing_mapping(self):
        rcs = RealityCaptureService(None)
        proxies = rcs._proxies
        rcs.set_proxy("user", "password", "proxy.example.com:8080")

        rcs.unset_proxy()

        assert proxies == {}
        assert rcs._proxies is proxies

