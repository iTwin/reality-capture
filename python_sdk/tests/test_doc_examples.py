import subprocess
import pathlib
import pytest
import os

PROJECT_ROOT = pathlib.Path(__file__).parent.parent.resolve()
SPECS_DIR = PROJECT_ROOT / "docs" / "specifications" / "examples"
specs_examples = list(SPECS_DIR.glob("*.py"))
SERVICE_DIR = PROJECT_ROOT / "docs" / "service" / "examples"
service_examples = list(SERVICE_DIR.glob("*.py"))
SRC_DIR = PROJECT_ROOT / "src"


class TestDocExamples:
    def setup_method(self):
        self.env = os.environ.copy()
        self.env["PYTHONPATH"] = str(SRC_DIR) + os.pathsep + self.env.get("PYTHONPATH", "")

    @pytest.mark.parametrize("example", specs_examples, ids=lambda e: e.name)
    def test_example_runs(self, example):
        subprocess.run(["python", str(example)], check=True, env=self.env, capture_output=True)

    @pytest.mark.parametrize("example", service_examples, ids=lambda e: e.name)
    def test_example_runs_alternate(self, example):
        # Another test variant using the same env
        subprocess.run(["python", str(example)], check=True, env=self.env, capture_output=True)


