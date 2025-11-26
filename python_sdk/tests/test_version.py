import re
import sys
from unittest.mock import patch
from importlib import metadata, import_module


# Taken from https://github.com/python/peps/issues/226
# See https://peps.python.org/pep-0440/
pepver_regex = (r'^([1-9]\d*!)?(0|[1-9]\d*)(\.(0|[1-9]\d*))*((a|b|rc)(0|[1-9]\d*))?'
                r'(\.post(0|[1-9]\d*))?(\.dev(0|[1-9]\d*))?$')


class TestVersion:
    def test_version(self):
        from reality_capture import __version__
        assert re.match(pepver_regex, __version__)

    def test_version_fails(self):
        if "reality_capture" in sys.modules:
            del sys.modules["reality_capture"]  # Ensure a fresh import

        with patch("importlib.metadata.version", side_effect=metadata.PackageNotFoundError):
            reality_capture = import_module("reality_capture")  # Force re-import
            assert reality_capture.__version__ == "0.0.dev0"
            assert re.match(pepver_regex, reality_capture.__version__)
