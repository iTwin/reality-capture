import re
import sys
from unittest.mock import patch
from importlib import metadata, import_module


# Taken from https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
semver_regex = (r'^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)'
                r'(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$')


class TestVersion:
    def test_version(self):
        from reality_capture import __version__
        assert re.match(semver_regex, __version__)

    def test_version_fails(self):
        if "reality_capture" in sys.modules:
            del sys.modules["reality_capture"]  # Ensure a fresh import

        with patch("importlib.metadata.version", side_effect=metadata.PackageNotFoundError):
            reality_capture = import_module("reality_capture")  # Force re-import
            assert reality_capture.__version__ == "0.0.0-clone"
            assert re.match(semver_regex, reality_capture.__version__)
