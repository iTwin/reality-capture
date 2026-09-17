import shutil
import sqlite3
from os.path import exists
from unittest.mock import patch, MagicMock

import pytest
import os
import sys

from reality_capture.on_premise.engine_manager import EngineManager
from reality_capture.on_premise.job_manager import JobManager
from reality_capture.on_premise.result import ManagerErrorCode, Result


class TestOnPremEngine:
    @pytest.fixture(autouse=True)
    def tmp_folder(self, tmp_path):
        self.tmp_dir = str(tmp_path)
        yield
        # Make sure directory is writable before cleanup (for read-only test)
        for root, dirs, files in os.walk(self.tmp_dir):
            for d in dirs:
                try:
                    dirpath = os.path.join(root, d)
                    if sys.platform == "win32":
                        import subprocess
                        subprocess.run(["icacls", dirpath, "/remove:d", "Everyone"], capture_output=True)
                    else:
                        os.chmod(dirpath, 0o755)
                except (OSError, PermissionError):
                    pass
        shutil.rmtree(self.tmp_dir, ignore_errors=True)

    def test_read_only_folder(self):
        # Create a read-only directory
        os.makedirs(self.tmp_dir, exist_ok=True)
        jq_path = os.path.join(self.tmp_dir, "jq")
        os.mkdir(jq_path)

        # Set read-only permissions (cross-platform)
        if sys.platform == "win32":
            import subprocess
            subprocess.run(["icacls", jq_path, "/deny", "Everyone:(W,D,AD)"], check=True, capture_output=True)
        else:
            os.chmod(jq_path, 0o555)

        # Attempt to create EngineManager in a read-only directory
        with pytest.raises(RuntimeError):
            jm = JobManager(jq_path)

    def test_error_message(self):
        for e in ManagerErrorCode:
            jde = Result(e, None)
            assert jde.get_error_as_str() != ""

        a = 2
        jde = Result(None, a)
        assert jde.get_error_as_str() == ""

    def test_init_throw_job(self):
        jq_path = os.path.join(self.tmp_dir, "jq")
        os.mkdir(jq_path)

        mock_cursor = MagicMock()
        mock_cursor.execute.side_effect = [None, sqlite3.OperationalError("DB error")]

        mock_conn = MagicMock()
        mock_conn.cursor.return_value = mock_cursor

        with patch("sqlite3.connect", return_value=mock_conn):
            with pytest.raises(RuntimeError):
                jm = JobManager(jq_path)

    def test_init_throw_engine(self):
        jq_path = os.path.join(self.tmp_dir, "jq")
        os.mkdir(jq_path)
        open(os.path.join(jq_path, "JobQueue.db"), "w").close()

        mock_cursor = MagicMock()
        mock_cursor.execute.side_effect = [sqlite3.OperationalError("DB error")]

        mock_conn = MagicMock()
        mock_conn.cursor.return_value = mock_cursor

        with patch("sqlite3.connect", return_value=mock_conn):
            with pytest.raises(RuntimeError):
                em = EngineManager(jq_path)