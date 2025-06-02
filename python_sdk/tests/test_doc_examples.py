import subprocess
import pathlib
import pytest

EXAMPLES_DIR = pathlib.Path(__file__).parent.parent / "docs" / "specifications" / "examples"
examples = list(EXAMPLES_DIR.glob("*.py"))


@pytest.mark.parametrize("example", examples, ids=[e.name for e in examples])
def test_example_runs(example):
    subprocess.run(["python", str(example)], check=True)
