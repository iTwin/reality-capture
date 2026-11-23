import pathlib
import runpy

import pytest

PROJECT_ROOT = pathlib.Path(__file__).parent.parent.resolve()
DOCS_DIR = PROJECT_ROOT / "docs"
DOC_EXAMPLES = sorted(DOCS_DIR.glob("*/examples/*.py"))


class TestDocExamples:
    @pytest.mark.parametrize(
        "example",
        DOC_EXAMPLES,
        ids=lambda example: str(example.relative_to(DOCS_DIR)),
    )
    def test_example_runs(self, example):
        runpy.run_path(str(example), run_name="__main__")
