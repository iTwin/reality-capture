from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum
import sqlite3

from reality_capture.on_premise._generic_manager import GenericManager
from reality_capture.on_premise.result import Result, ManagerErrorCode


class EngineSignal(Enum):
    PAUSE = "Pause"
    CLOSE = "Close"
    FINISH = "Finish"
    STOP = "Stop"
    PAUSE_RIGHT_NOW = "PauseRightNow"
    SKIP = "Skip"
    UNPAUSE = "Unpause"


class EngineStatus(Enum):
    UNKNOWN = "Unknown"
    BUSY = "Busy"
    READY = "Ready"
    PAUSED = "Paused"
    TURNED_OFF = "TurnedOff"


class EngineDetails(BaseModel):
    host_name: str = Field(description="The hostname of the engine.")
    user_name: str = Field(description="The user of the engine.")
    version: str = Field(description="The version of the engine.")
    start_time: datetime = Field(description="The start time of the engine.")
    end_time: Optional[datetime] = Field(description="The end time of the engine if it was properly stopped.")
    last_beat_time: Optional[datetime] = Field(description="The last beat time of the engine.")
    status: EngineStatus = Field(description="The status of the engine.")
    signal: Optional[EngineSignal] = Field(description="The signal of the engine waiting to be processed.")


class EngineManager(GenericManager):
    def __init__(self, job_queue_dir: str):
        super().__init__(job_queue_dir)
        self._db_path = self._job_queue_dir + "/Engines.db"
        self._connection = sqlite3.connect(self._db_path)

    def _close(self):
        if self._connection is not None:
            self._connection.close()
            self._connection = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self._close()
        return False

    def __del__(self):
        self._close()

    @staticmethod
    def _int_to_status(status_as_int: int):
        mapping = {
            1: EngineStatus.BUSY,
            2: EngineStatus.READY,
            4: EngineStatus.PAUSED,
            8: EngineStatus.TURNED_OFF,
        }
        if status_as_int in mapping:
            return mapping[status_as_int]
        return EngineStatus.UNKNOWN

    @staticmethod
    def _int_to_signal(signal_as_int: int):
        mapping = {
            1: EngineSignal.PAUSE,
            2: EngineSignal.CLOSE,
            4: EngineSignal.FINISH,
            8: EngineSignal.STOP,
            16: EngineSignal.PAUSE_RIGHT_NOW,
            32: EngineSignal.SKIP,
            64: EngineSignal.UNPAUSE,
        }
        return mapping[signal_as_int]


    @staticmethod
    def _signal_to_int(signal: EngineSignal) -> int:
        mapping = {
            EngineSignal.PAUSE: 1,
            EngineSignal.CLOSE: 2,
            EngineSignal.FINISH: 4,
            EngineSignal.STOP: 8,
            EngineSignal.PAUSE_RIGHT_NOW: 16,
            EngineSignal.SKIP: 32,
            EngineSignal.UNPAUSE: 64,
        }
        return mapping[signal]

    def get_job_queue_dir(self) -> str:
        """
        Return the job queue directory path.

        :return: The job queue directory path
        """
        return self._job_queue_dir

    def get_engine_hostnames(self) -> Result[list[str]]:
        """
        Get the list of engine hostnames in the JobQueue. Engines can be in any state.

        :return: A Result[list[str]] of engine hostnames
        """
        try:
            cursor = self._connection.cursor()
            cursor.execute("SELECT Hostname FROM Engines")
            engines = [row[0] for row in cursor.fetchall()]
        except sqlite3.DatabaseError:
            return Result(ManagerErrorCode.SQLITE_ERROR, None)
        return Result(None, engines)

    def get_engine(self, engine_host_name: str) -> Result[EngineDetails]:
        """
        Get the details for a specific engine

        :param engine_host_name: Name of the engine
        :return: A Result[EngineDetails] with the engine details
        """
        try:
            cursor = self._connection.cursor()
            cursor.execute(
                "SELECT Version, Username, Hostname, Status, StartTime, LastHeartBeat, EndTime, Signal "
                "FROM Engines WHERE Hostname = ?",
                (engine_host_name,)
            )
            row = cursor.fetchone()

            if row is None:
                return Result(ManagerErrorCode.ENGINE_NOT_FOUND, None)

            version, username, hostname, status_int, start_time, last_beat_time, end_time, signal_int = row

            start_time = self._parse_datetime(start_time)
            last_beat_time = self._parse_datetime(last_beat_time) if last_beat_time else None
            end_time = self._parse_datetime(end_time) if end_time else None
            eng_signal = None
            if signal_int != 0:
                eng_signal = self._int_to_signal(signal_int)

            # Create EngineDetails, leaving status and signal as defaults
            ed = EngineDetails(
                host_name=hostname,
                user_name=username,
                version=version,
                start_time=start_time,
                end_time=end_time,
                last_beat_time=last_beat_time,
                signal=eng_signal,
                status=self._int_to_status(status_int)
            )
        except sqlite3.DatabaseError:
            return Result(ManagerErrorCode.SQLITE_ERROR, None)
        return Result(None, ed)

    def send_signal(self, engine_host_name: str, signal: EngineSignal) -> Result[EngineDetails]:
        """
        Send a signal to an engine in order to change its behaviour

        :param engine_host_name: Name of the engine
        :param signal: Signal to send to the engine
        :return: A Result[EngineDetails] with the engine details
        """
        lock_fd = self._acquire_lock(self._db_path, timeout=self._timeout_lock_s)
        if lock_fd is None:
            return Result(ManagerErrorCode.DB_BUSY, None)
        try:
            cursor = self._connection.cursor()
            cursor.execute("BEGIN IMMEDIATE")
            try:
                # Check engine exists and is running
                cursor.execute(
                    "SELECT COUNT(*) FROM Engines WHERE Hostname = ? AND (EndTime IS NULL OR EndTime = '')",
                    (engine_host_name,)
                )
                count = cursor.fetchone()[0]
                if count == 0:
                    return Result(ManagerErrorCode.ENGINE_NOT_FOUND, None)

                # Bitwise OR the new signal onto the existing signal
                signal_int = self._signal_to_int(signal)
                cursor.execute(
                    "UPDATE Engines SET Signal = Signal | ? WHERE Hostname = ? AND (EndTime IS NULL OR EndTime = '')",
                    (signal_int, engine_host_name)
                )
                self._connection.commit()
            except sqlite3.OperationalError:
                self._connection.rollback()
                return Result(ManagerErrorCode.SQLITE_ERROR, None)
        finally:
            self._release_lock(lock_fd, self._db_path)

        return self.get_engine(engine_host_name)
