# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

from typing import List, Optional
from datetime import datetime
from dateutil import parser

from cc_api_wrapper.enums import MeshQuality, Format, JobType, JobOutcome, JobState


class JobInput:
    """
    Description of an input for ContextCapture
    """
    def __init__(self, reality_data_id: str, description: str):
        """
        Constructor

        :param reality_data_id: Reality Data id of the input
        :param description: Description of the input
        """
        self._rd_id = reality_data_id
        self._description = description

    def reality_data_id(self):
        """
        Reality data id for the input

        :return: Reality data id for the input
        """
        return self._rd_id

    def description(self):
        """
        Description for the input

        :return: Description for the input
        """
        return self._description


class CacheSettings:
    """
    Cache settings for a job
    """
    def __init__(self, create_cache: bool, use_cache: str):
        """
        Constructor

        :param create_cache: If True, will create a cache folder in the workspace if the job is successful
        :param use_cache: If specified, will use a cache folder from the workspace for faster processing
        """
        self._create_cache = create_cache
        self._use_cache = use_cache

    def create_cache(self) -> bool:
        """
        Specify if the job will create a cache if it is successful

        :return: True if cache will be created
        """
        return self._create_cache

    def use_cache(self) -> str:
        """
        Specify which cache to use if set
        :return: Cache from job id
        """
        return self._use_cache


class JobCreateSettings:
    """
    Settings necessary for a job creation
    """
    def __init__(self, mesh_quality: MeshQuality, outputs: List[Format],
                 cache_settings: Optional[CacheSettings], processing_engines: int = 0):
        """
        Constructor

        :param mesh_quality: Mesh quality for the job
        :param outputs: List of outputs to be produced
        :param cache_settings: Optional cache settings
        :param processing_engines: Number of engines to be use, 0 = max available
        """
        self._quality = mesh_quality
        self._outputs = outputs
        self._cache_settings = cache_settings
        self._processing_engines = processing_engines

    def quality(self) -> MeshQuality:
        """
        Mesh quality for the job

        :return: Mesh quality
        """
        return self._quality

    def outputs(self) -> List[Format]:
        """
        Outputs for the job

        :return: List of format to be produced
        """
        return self._outputs

    def cache_settings(self) -> Optional[CacheSettings]:
        """
        Optional cache settings for the job

        :return: Optional cache settings for the job
        """
        return self._cache_settings

    def processing_engines(self) -> int:
        """
        Number of processing engines

        :return: Number of processing engines
        """
        return self._processing_engines


class JobCreate:
    """
    Complete payload for creating a job
    """
    def __init__(self, job_type: JobType, job_name: str, workspace_id: str,
                 job_inputs: List[JobInput], job_create_settings: JobCreateSettings):
        """
        Constructor

        :param job_type: Job type
        :param job_name: Name for the job
        :param workspace_id: Workspace id linking the job
        :param job_inputs: List of inputs
        :param job_create_settings: Settings for the job
        """
        self._job_type = job_type
        self._job_name = job_name
        self._workspace_id = workspace_id
        self._inputs = job_inputs
        self._settings = job_create_settings

    def job_type(self, jt: Optional[JobType] = None) -> JobType:
        """
        Getter/setter for job type

        :param jt: Optional new job type
        :return: Job type
        """
        if jt is not None:
            self._job_type = jt
        return self._job_type

    def job_name(self, jn: Optional[str] = None) -> str:
        """
        Getter/setter for job name

        :param jn: Optional new job name
        :return: Job name
        """
        if jn is not None:
            self._job_name = jn
        return self._job_name

    def workspace_id(self, w_id: Optional[str] = None) -> str:
        """
        Getter/setter for workspace id
        :param w_id: Optional new workspace id
        :return: Workspace id
        """
        if w_id is not None:
            self._workspace_id = w_id
        return self._workspace_id

    def inputs(self, inputs: Optional[List[JobInput]] = None) -> List[JobInput]:
        """
        Getter/setter for inputs

        :param inputs: Optional new list of inputs
        :return: List of inputs
        """
        if inputs is not None:
            self._inputs = inputs
        return self._inputs

    def settings(self, settings: Optional[JobCreateSettings] = None) -> JobCreateSettings:
        """
        Getter/setter for job settings

        :param settings: Optional new settings
        :return: Job settings
        """
        if settings is not None:
            self._settings = settings
        return self._settings


class JobExecutionInformation:
    """
    Information relative to the job execution
    """
    def __init__(self, submission_date_time_str: str,
                 start_date_time_str: Optional[str],
                 end_date_time_str: Optional[str],
                 estimated_units: Optional[float]):
        """
        Constructor

        :param submission_date_time_str: Submission date time, cannot be empty
        :param start_date_time_str: Optional start date time string
        :param end_date_time_str: Optional end date time string
        :param estimated_units: Optional estimated units
        """
        self._submission_date_time = parser.parse(submission_date_time_str)
        self._start_date_time = parser.parse(start_date_time_str) if start_date_time_str is not None else None
        self._end_date_time = parser.parse(end_date_time_str) if end_date_time_str is not None else None
        self._estimated_units = estimated_units if estimated_units is not None else None

    def submission_date_time(self) -> datetime:
        """
        Submission date time

        :return: Submission date time
        """
        return self._submission_date_time

    def start_date_time(self) -> Optional[datetime]:
        """
        Start date time if available

        :return: Start date time or None
        """
        return self._start_date_time

    def end_date_time(self) -> Optional[datetime]:
        """
        End date time if available

        :return: End date time or None
        """
        return self._end_date_time

    def outcome(self) -> Optional[JobOutcome]:
        """
        Outcome if available

        :return: Outcome or None
        """
        return self._outcome

    def estimated_units(self) -> Optional[float]:
        """
        Estimated units if available

        :return: Estimated units or None
        """
        return self._estimated_units


class JobOutput:
    """
    Describe a ContextCapture job output
    """
    def __init__(self, job_format: Format, reality_data_id: str):
        """
        Constructor

        :param job_format: Format of the output
        :param reality_data_id: Reality data id containing the output
        """
        self._format = job_format
        self._rd_id = reality_data_id

    def format(self) -> Format:
        """
        Format of the output

        :return: Format
        """
        return self._format

    def reality_data_id(self) -> str:
        """
        Reality data id containing the output

        :return: Reality data id
        """
        return self._rd_id


class JobSettings:
    """
    General settings relative to a job
    """
    def __init__(self, quality: MeshQuality, processing_engines: int, outputs: List[JobOutput],
                 cache_settings: Optional[CacheSettings]):
        """
        Constructor

        :param quality: Mesh Quality
        :param processing_engines: Number of processing engines
        :param outputs: List of outputs
        :param cache_settings: Optional cache settings
        """
        self._quality = quality
        self._engines = processing_engines
        self._outputs = outputs
        self._cache_settings = cache_settings

    def quality(self) -> MeshQuality:
        """
        Mesh quality of the job

        :return: Mesh Quality
        """
        return self._quality

    def processing_engines(self) -> int:
        """
        Maximum number of processing engines for the job

        :return: Maximum number of engines
        """
        return self._engines

    def outputs(self) -> List[JobOutput]:
        """
        List of job outputs

        :return: List of job outputs
        """
        return self._outputs

    def cache_settings(self) -> Optional[CacheSettings]:
        """
        Optional cache settings

        :return: Optional cache settings
        """
        return self._cache_settings


class Job:
    """
    Job information
    """
    def __init__(self, job_id: str, name: str, job_type: JobType, job_state: JobState, creation_date_time_str: str,
                 location: str, workspace_id: str, email: str, execution_information: Optional[JobExecutionInformation],
                 inputs: List[JobInput], settings: JobSettings):
        """
        Constructor

        :param job_id: Job id
        :param name: Job name
        :param job_type: Type of job
        :param job_state: State of the job
        :param creation_date_time_str: Creation date time as a string
        :param location: Location
        :param workspace_id: Workspace id linked to the job
        :param email: User email for this job
        :param execution_information: Execution information for the job
        :param inputs: Inputs for the job
        :param settings: Settings for the job
        """
        self._id = job_id
        self._name = name
        self._type = job_type
        self._state = job_state
        self._creation_date_time = parser.parse(creation_date_time_str)
        self._location = location
        self._workspace_id = workspace_id
        self._email = email
        self._exec_info = execution_information
        self._inputs = inputs
        self._settings = settings

    def id(self) -> str:
        """
        :return: Job id
        """
        return self._id

    def name(self) -> str:
        """
        :return: Job name
        """
        return self._name

    def type(self) -> JobType:
        """
        :return: Job type
        """
        return self._type

    def state(self) -> JobState:
        """
        :return: State of the job
        """
        return self._state

    def creation_date_time(self) -> datetime:
        """
        :return: Creation date time of the job
        """
        return self._creation_date_time

    def location(self) -> str:
        """
        :return: Cluster location of the job
        """
        return self._location

    def workspace_id(self) -> str:
        """
        :return: Workspace id linked to the job
        """
        return self._workspace_id

    def email(self) -> str:
        """
        :return: User email for this job
        """
        return self._email

    def execution_information(self) -> Optional[JobExecutionInformation]:
        """
        :return: Optional job execution information for this job
        """
        return self._exec_info

    def inputs(self) -> List[JobInput]:
        """
        :return: List of inputs for this job
        """
        return self._inputs

    def settings(self) -> JobSettings:
        """
        :return: Settings for this job
        """
        return self._settings


class JobProgress:
    """
    Progress info for a job
    """
    def __init__(self, percentage: float, state: JobState, step: str):
        """
        Constructor

        :param percentage: Job progress percentage (between 0 and 100)
        :param state: Job current state
        :param step: Job current step
        """
        self._percentage = percentage
        self._state = state
        self._step = step

    def percentage(self) -> float:
        """
        :return: Job progress percentage (between 0 and 100)
        """
        return self._percentage

    def state(self) -> JobState:
        """
        :return: Job current state
        """
        return self._state

    def step(self) -> str:
        """
        :return: Job current step
        """
        return self._step
