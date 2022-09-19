# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

from typing import List, Optional
from datetime import datetime
from dateutil import parser

from rda_api_sdk.enums import JobState
from rda_api_sdk.enums import JobType


class JobRealityData:
    """
    Description of an input or output RDA
    """

    def __init__(self, name: str, reality_data_id: str):
        """
        Constructor

        :param name: Name of the Reality Data in the settings
        :param reality_data_id: Reality Data id of the input
        """
        self._name = name
        self._rd_id = reality_data_id

    def name(self):
        """
        Name for the RD

        :return: Name for the RD
        """
        return self._name

    def reality_data_id(self):
        """
        Reality data id for the RD

        :return: Reality data id for the RD
        """
        return self._rd_id


class JobExecutionInformation:
    """
    information relative to the job execution
    """

    def __init__(self, submission_date_time_str: str,
                 started_date_time_str: Optional[str],
                 ended_date_time_str: Optional[str],
                 estimated_units: Optional[float],
                 exit_code: Optional[int]
                 ):
        """
        Constructor

        :param submission_date_time_str: Submission date time, cannot be empty
        :param started_date_time_str: Optional start date time string
        :param ended_date_time_str: Optional end date time string
        :param estimated_units: Optional unit estimation
        :param exit_code: Optional exit code
        """
        self._submission_date_time = parser.parse(submission_date_time_str)
        self._started_date_time = parser.parse(started_date_time_str) if started_date_time_str is not None else None
        self._ended_date_time = parser.parse(ended_date_time_str) if ended_date_time_str is not None else None
        self._estimated_units = estimated_units if estimated_units is not None else None
        self._exit_code = exit_code if exit_code is not None else None

    def submission_date_time(self) -> datetime:
        """
        Submission date time

        :return: Submission date time
        """
        return self._submission_date_time

    def started_date_time(self) -> Optional[datetime]:
        """
        Started date time if available

        :return: Started date time or None
        """
        return self._started_date_time

    def ended_date_time(self) -> Optional[datetime]:
        """
        Ended date time if available

        :return: Ended date time or None
        """
        return self._ended_date_time

    def estimated_units(self) -> Optional[float]:
        """
        Estimated units if available

        :return: Estimated units or None
        """
        return self._estimated_units

    def exit_code(self) -> Optional[int]:
        """
        Exit code if available

        :return: Exit code or None
        """
        return self._exit_code

    @classmethod
    def from_json(cls, j_dict: dict) -> "JobExecutionInformation":
        return cls(
            j_dict.get("submissionDateTime"),
            j_dict.get("startedDateTime"),
            j_dict.get("endedDateTime"),
            j_dict.get("estimatedUnits"),
            j_dict.get("exitCode")
        )


class JobCostEstimation:
    """
    information relative to the job cost estimation
    """

    def __init__(self,
                 estimated_cost: Optional[float] = None,
                 number_of_photos: Optional[int] = None,
                 giga_pixels: Optional[float] = None,
                 scene_width: Optional[float] = None,
                 scene_length: Optional[float] = None,
                 scene_height: Optional[float] = None,
                 detector_scale: Optional[float] = None,
                 detector_cost: Optional[float] = None
                 ):
        """
        Constructor

        :param estimated_cost:
        :param number_of_photos:
        :param giga_pixels:
        :param scene_width:
        :param scene_length:
        :param scene_height:
        :param detector_scale:
        :param detector_cost:
        """
        self._estimated_cost = estimated_cost
        self._number_of_photos = number_of_photos
        self._giga_pixels = giga_pixels
        self._scene_width = scene_width
        self._scene_length = scene_length
        self._scene_height = scene_height
        self._detector_scale = detector_scale
        self._detector_cost = detector_cost

    def estimated_cost(self) -> Optional[float]:
        return self._estimated_cost

    def number_of_photos(self) -> Optional[int]:
        return self._number_of_photos

    def giga_pixels(self) -> Optional[float]:
        return self._giga_pixels

    def scene_width(self) -> Optional[float]:
        return self._scene_width

    def scene_length(self) -> Optional[float]:
        return self._scene_length

    def scene_height(self) -> Optional[float]:
        return self._scene_height

    def detector_scale(self) -> Optional[float]:
        return self._detector_scale

    def detector_cost(self) -> Optional[float]:
        return self._detector_cost

    @classmethod
    def from_json(cls, j_dict: dict) -> "JobEstimatedCost":
        return cls(
            j_dict.get("estimatedCost"),
            j_dict.get("numberOfPhotos"),
            j_dict.get("gigaPixels"),
            j_dict.get("sceneWidth"),
            j_dict.get("sceneLength"),
            j_dict.get("sceneHeight"),
            j_dict.get("detectorScale"),
            j_dict.get("detectorCost")
        )

    def to_jdict(self):
        jdict = dict()
        if self._estimated_cost is not None:
            jdict["estimatedCost"] = self._estimated_cost
        if self._number_of_photos is not None:
            jdict["numberOfPhotos"] = self._number_of_photos
        if self._giga_pixels is not None:
            jdict["gigaPixels"] = self._giga_pixels
        if self._scene_width is not None:
            jdict["sceneWidth"] = self._scene_width
        if self._scene_length is not None:
            jdict["sceneLength"] = self._scene_length
        if self._scene_height is not None:
            jdict["sceneHeight"] = self._scene_height
        if self._detector_scale is not None:
            jdict["detectorScale"] = self._detector_scale
        if self._detector_cost is not None:
            jdict["detectorCost"] = self._detector_cost
        return jdict;


class JobCreateSettings:
    """
    Settings necessary for a job creation
    """

    def __init__(self):
        """
        Constructor
        """
        self._job_type = None
        self._name = None
        self._inputs = []
        self._outputs = []

    def inputs(self) -> List[JobRealityData]:
        """
        Inputs for the job

        :return: List of input RD
        """
        return self._inputs

    def outputs(self) -> List[str]:
        """
        Outputs for the job

        :return: List of output RD
        """
        return self._outputs

    def job_type(self) -> JobType:
        """
        Type of the job

        :return: Type of the job for those settings
        """
        return self._job_type

    def to_jdict(self):
        return {}


class Objects2DJobCreateSettings(JobCreateSettings):
    """
    Settings necessary for an Objects2D job creation
    """

    def __init__(self, photo_scene_id: str, photo_object_detector_id: str):
        """
        Constructor

        :param photo_scene_id: Scene containing photos for the job
        :param photo_object_detector_id: Photo object detector for the job
        """
        super().__init__()
        self._job_type = JobType.OBJECTS2D
        self._inputs = [JobRealityData("photos", photo_scene_id),
                        JobRealityData("photoObjectDetector", photo_object_detector_id)]
        self._outputs = ["objects2D"]

    def to_jdict(self):
        return {
            "inputs": [{"name": i.name(), "realityDataId": i.reality_data_id()} for i in self._inputs],
            "outputs": [i for i in self._outputs]
        }


class Segmentation2DJobCreateSettings(JobCreateSettings):
    """
    Settings necessary for a Segmentation2D job creation
    """

    def __init__(self,
                 photos_scene_id: str = None, photo_segmentation_detector_id: str = None,
                 orthophoto_scene_id: str = None, orthophoto_segmentation_detector_id: str = None,
                 export_polygons_2D: bool = False, export_lines_2D: bool = False):
        """
        Constructor

        :param photos_scene_id: Scene containing photos for the job
        :param photo_segmentation_detector_id: Photo segmentation detector for the job
        :param orthophoto_scene_id: Scene containing orthophoto for the job
        :param orthophoto_segmentation_detector_id: orthophoto segmentation detector for the job

        """
        super().__init__()
        self._job_type = JobType.SEGMENTATION2D
        if photos_scene_id is not None:
            self._inputs = [JobRealityData("photos", photos_scene_id),
                            JobRealityData("photoSegmentationDetector", photo_segmentation_detector_id)
                            ]
            self._outputs = ["segmentation2D"]
        elif orthophoto_scene_id is not None:
            self._inputs = [JobRealityData("orthophoto", orthophoto_scene_id),
                            JobRealityData("orthophotoSegmentationDetector", orthophoto_segmentation_detector_id)
                            ]
            self._outputs = ["segmentation2D"]
            if export_polygons_2D:
                self._outputs.append("polygons2D")
                self._outputs.append("exportedPolygons2DSHP")
            if export_lines_2D:
                self._outputs.append("lines2D")

        else:
            print("Invalid S2D create settings")

    def to_jdict(self):
        return {
            "inputs": [{"name": i.name(), "realityDataId": i.reality_data_id()} for i in self._inputs],
            "outputs": [i for i in self._outputs]
        }


class JobCreate:
    """
    Complete payload for creating a job
    """

    def __init__(self, job_settings: JobCreateSettings, job_name: str, project_id: str):
        """
        Constructor

        :param job_settings: Settings for the job
        :param job_name: Name for the job
        :param project_id: Project id linking the job
        """
        self._job_name = job_name
        self._project_id = project_id
        self._settings = job_settings

    def settings(self, settings: Optional[JobCreateSettings] = None) -> JobCreateSettings:
        """
        Getter/setter for job settings

        :param settings: Optional new settings
        :return: Job settings
        """
        if settings is not None:
            self._settings = settings
        return self._settings

    def job_name(self, jn: Optional[str] = None) -> str:
        """
        Getter/setter for job name

        :param jn: Optional new job name
        :return: Job name
        """
        if jn is not None:
            self._job_name = jn
        return self._job_name

    def project_id(self, p_id: Optional[str] = None) -> str:
        """
        Getter/setter for workspace id
        :param p_id: Optional new project id
        :return: Project id
        """
        if p_id is not None:
            self._project_id = p_id
        return self._project_id


class JobSettings:
    """
    General settings relative to a job
    """

    def __init__(self, inputs: List[JobRealityData], outputs: List[JobRealityData]):
        """
        Constructor

        :param inputs: List of inputs
        :param outputs: List of outputs
        """
        self._inputs = inputs
        self._outputs = outputs

    def inputs(self) -> List[JobRealityData]:
        """
        List of job inputs

        :return: List of job inputs
        """
        return self._inputs

    def outputs(self) -> List[JobRealityData]:
        """
        List of job outputs

        :return: List of job outputs
        """
        return self._outputs

    @classmethod
    def from_json(cls, j_dict: dict) -> "JobSettings":
        job_inputs = []
        job_outputs = []
        for input_entry in j_dict["inputs"]:
            job_inputs.append(JobRealityData(input_entry["name"], input_entry["realityDataId"]))
        for output_entry in j_dict["outputs"]:
            job_outputs.append(JobRealityData(output_entry["name"], output_entry.get("realityDataId")))
        return cls(job_inputs, job_outputs)


class Job:
    """
    Job information
    """

    def __init__(self, job_id: str, name: str, job_type: JobType, job_state: JobState, creation_date_time_str: str,
                 cost_estimation: Optional[JobCostEstimation], data_center: str, project_id: str, email: str,
                 execution_information: Optional[JobExecutionInformation],
                 settings: JobSettings):
        """
        Constructor

        :param job_id: Job id
        :param name: Job name
        :param job_type: Type of job
        :param job_state: State of the job
        :param creation_date_time_str: Creation date time as a string
        :param cost_estimation: option cost estimation
        :param data_center: Data Center
        :param project_id: Project id linked to the job
        :param email: User email for this job
        :param execution_information: optional Execution information for the job
        :param settings: Settings for the job
        """
        self._id = job_id
        self._name = name
        self._type = job_type
        self._state = job_state
        self._creation_date_time = parser.parse(creation_date_time_str)
        self._cost_estimation = cost_estimation
        self._data_center = data_center
        self._project_id = project_id
        self._email = email
        self._exec_info = execution_information
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

    def cost_estimation(self) -> Optional[JobCostEstimation]:
        """
        :return: cost estimation of the job
        """
        return self._cost_estimation

    def data_center(self) -> str:
        """
        :return: Cluster location of the job
        """
        return self._data_center

    def project_id(self) -> str:
        """
        :return: Project id linked to the job
        """
        return self._project_id

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

    def settings(self) -> JobSettings:
        """
        :return: Settings for this job
        """
        return self._settings

    @classmethod
    def from_json(cls, j_dict: dict) -> "Job":
        return cls(j_dict["id"],
                   j_dict["name"],
                   JobType.from_str(j_dict["type"]),
                   JobState.from_str(j_dict["state"]),
                   j_dict["createdDateTime"],
                   JobCostEstimation.from_json(j_dict["costEstimation"])
                   if "costEstimation" in j_dict.keys() else None,
                   j_dict["dataCenter"],
                   j_dict["iTwinId"],
                   j_dict["email"],
                   JobExecutionInformation.from_json(j_dict["executionInformation"])
                   if "executionInformation" in j_dict.keys() else None,
                   JobSettings.from_json(j_dict["settings"])
                   )


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

    @classmethod
    def from_json(cls, j_dict: dict) -> "JobProgress":
        return cls(j_dict["percentage"],
                   JobState.from_str(j_dict["state"]),
                   j_dict["step"])
