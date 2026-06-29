import shutil
import stat
import pytest
import os

from reality_capture.on_premise.engine_manager import EngineManager, EngineStatus, EngineSignal
from reality_capture.on_premise.result import ManagerErrorCode


class TestOnPremEngine:
    @pytest.fixture(autouse=True)
    def tmp_folder(self, tmp_path):
        self.tmp_dir = str(tmp_path)
        yield
        shutil.rmtree(self.tmp_dir, ignore_errors=True)

    def test_create(self):
        em = EngineManager(self.tmp_dir + "/jq")
        assert em.get_job_queue_dir() == self.tmp_dir + "/jq"
        hostnames_res = em.get_engine_hostnames()
        assert not hostnames_res.is_error()
        assert hostnames_res.value is not None
        assert len(hostnames_res.value) == 0

        get_result = em.get_engine("COMPUTER")
        assert get_result.is_error()
        assert get_result.value is None
        assert get_result.error is ManagerErrorCode.ENGINE_NOT_FOUND

    def test_with(self):
        with EngineManager(self.tmp_dir + "/jq") as em:
            assert em.get_job_queue_dir() == self.tmp_dir + "/jq"

    def test_faulty_dbs(self):
        # Create a faulty database file
        os.mkdir(self.tmp_dir + "/jq")
        faulty_db_path = self.tmp_dir + "/jq/engines.db"
        with open(faulty_db_path, "w") as f:
            f.write("This is not a valid database file.")

        em = EngineManager(self.tmp_dir + "/jq")
        res = em.get_engine_hostnames()
        assert res.is_error()
        assert res.value is None
        assert res.error is ManagerErrorCode.SQLITE_ERROR

        res = em.get_engine("COMPUTER")
        assert res.is_error()
        assert res.value is None
        assert res.error is ManagerErrorCode.SQLITE_ERROR

    def test_existing_db(self):
        # Copy data from DB_Engines to tmp dir
        current_dir = os.path.dirname(os.path.abspath(__file__))
        source_db_path = os.path.join(current_dir, "data", "DB_Engines", "Engines.db")
        target_db_path = os.path.join(self.tmp_dir, "jq", "Engines.db")
        os.makedirs(os.path.dirname(target_db_path), exist_ok=True)
        shutil.copyfile(source_db_path, target_db_path)

        em = EngineManager(self.tmp_dir + "/jq")
        res = em.get_engine_hostnames()
        assert not res.is_error()
        assert res.value is not None
        assert len(res.value) == 2
        engine_name = res.value[0]
        assert engine_name == "MINITEL"

        res = em.get_engine(engine_name)
        assert not res.is_error()
        assert res.value is not None
        engine = res.value
        assert engine.host_name == "MINITEL"
        assert engine.version == "26.0.3.99999"
        assert engine.user_name == "Rene.Coty"
        assert engine.status == EngineStatus.READY
        assert engine.start_time.isoformat() == "2026-06-26T08:15:12.473267"
        assert engine.end_time is None
        assert engine.last_beat_time is not None
        assert engine.last_beat_time.isoformat() == "2026-06-26T08:15:56.032184"
        assert engine.signal is None

        res = em.send_signal(engine_name, EngineSignal.PAUSE)
        assert not res.is_error()
        assert res.value is not None
        engine = res.value
        assert engine.signal is not None
        assert engine.signal == [EngineSignal.PAUSE]

        res = em.send_signal("TO8", EngineSignal.PAUSE)
        assert res.is_error()
        assert res.error == ManagerErrorCode.ENGINE_NOT_FOUND

        res = em.get_engine("TO7")
        assert not res.is_error()
        assert res.value is not None
        assert res.value.status == EngineStatus.UNKNOWN

    def test_existing_db_is_read_only(self):
        # Copy data from DB_Engines to tmp dir
        current_dir = os.path.dirname(os.path.abspath(__file__))
        source_db_path = os.path.join(current_dir, "data", "DB_Engines", "Engines.db")
        target_db_path = os.path.join(self.tmp_dir, "jq", "Engines.db")
        os.makedirs(os.path.dirname(target_db_path), exist_ok=True)
        shutil.copyfile(source_db_path, target_db_path)

        # Make target_db_path read only
        os.chmod(target_db_path, stat.S_IREAD | stat.S_IRGRP | stat.S_IROTH)

        em = EngineManager(self.tmp_dir + "/jq")
        res = em.send_signal("MINITEL", EngineSignal.PAUSE)
        assert res.is_error()
        assert res.error == ManagerErrorCode.SQLITE_ERROR

    def test_db_is_locked(self):
        # Copy data from DB_Engines to tmp dir
        current_dir = os.path.dirname(os.path.abspath(__file__))
        source_db_path = os.path.join(current_dir, "data", "DB_Engines", "Engines.db")
        target_db_path = os.path.join(self.tmp_dir, "jq", "Engines.db")
        os.makedirs(os.path.dirname(target_db_path), exist_ok=True)
        shutil.copyfile(source_db_path, target_db_path)

        em = EngineManager(self.tmp_dir + "/jq")
        em2 = EngineManager(self.tmp_dir + "/jq")

        fd = em._acquire_lock(target_db_path, 5)
        assert fd is not None
        try:
            em2._timeout_lock_s = 3  # For speed's sake
            res = em2.send_signal("MINITEL", EngineSignal.PAUSE)
            assert res.is_error()
            assert res.error == ManagerErrorCode.DB_BUSY
        finally:
            em._release_lock(fd, target_db_path)