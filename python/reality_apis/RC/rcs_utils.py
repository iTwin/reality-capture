# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

from __future__ import annotations
from enum import Enum
from typing import List, Union, NamedTuple

from reality_apis.utils import ReturnValue, JobState, JobDateTime


class RCJobType(Enum):
    """
    Possible types of Reality Conversion job.
    """
    CONVERSION = "Conversion"
    NONE = "not recognized"


class RCJobSettings:
    """
    Settings for Reality Conversion jobs.

    Attributes:
        inputs: Possible inputs for this job. Lists of inputs ids in the cloud, divided by type of data.
        outputs: Possible outputs for this job. Fill the types of outputs you want for the job with True before passing
            the settings to create_job.
        engines: Quantity of engines to be used by the job.
    """

    def __init__(self) -> None:
        self.inputs: RCJobSettings.Inputs = self.Inputs()
        self.outputs: RCJobSettings.Outputs = self.Outputs()
        self.engines: int = 0

    def to_json(self) -> dict:
        """
        Transform settings into a dictionary compatible with json.

        Returns:
            Dictionary with settings values.
        """

        settings_dict = {
                "inputs": list(),
                "processingEngines": self.engines,
                "outputs": list()
        }

        for rd_id in self.inputs.LAS:
            settings_dict["inputs"].append({"name": "LAS", "realityDataId": rd_id})
        for rd_id in self.inputs.LAZ:
            settings_dict["inputs"].append({"name": "LAZ", "realityDataId": rd_id})
        for rd_id in self.inputs.PLY:
            settings_dict["inputs"].append({"name": "PLY", "realityDataId": rd_id})
        for rd_id in self.inputs.E57:
            settings_dict["inputs"].append({"name": "E57", "realityDataId": rd_id})

        if self.outputs.OPC:
            settings_dict["outputs"].append("OPC")
        if self.outputs.cesium_point_cloud:
            settings_dict["outputs"].append("CesiumPointCloud")

        return settings_dict

    @classmethod
    def from_json(cls, settings_json: dict) -> ReturnValue[RCJobSettings]:
        """
        Transform json received from cloud service into settings.

        Args:
            settings_json: Dictionary with settings received from cloud service.
        Returns:
            New settings.
        """
        new_job_settings = cls()
        try:
            inputs_json = settings_json["inputs"]
            for input_dict in inputs_json:
                if input_dict["name"] == "LAS":
                    new_job_settings.inputs.LAS.append(input_dict["realityDataId"])
                elif input_dict["name"] == "LAZ":
                    new_job_settings.inputs.LAZ.append(input_dict["realityDataId"])
                elif input_dict["name"] == "PLY":
                    new_job_settings.inputs.PLY.append(input_dict["realityDataId"])
                elif input_dict["name"] == "E57":
                    new_job_settings.inputs.E57.append(input_dict["realityDataId"])
                else:
                    raise TypeError(
                        "found non expected input name:" + input_dict["name"]
                    )
            outputs_json = settings_json["outputs"]
            new_job_settings.outputs.OPC = []
            new_job_settings.outputs.cesium_point_cloud = []
            for output_dict in outputs_json:
                if output_dict["name"] == "OPC":
                    new_job_settings.outputs.OPC.append(output_dict["realityDataId"])
                elif output_dict["name"] == "CesiumPointCloud":
                    new_job_settings.outputs.cesium_point_cloud.append(output_dict["realityDataId"])
                else:
                    raise TypeError(
                        "found non expected output name" + output_dict["name"]
                    )
        except (KeyError, TypeError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        """
        Inputs for a Reality Conversion job.

        Attributes:
            LAS: A list of paths to LAS files.
            LAZ: A list of paths to LAZ files.
            PLY: A list of paths to PLY files.
            E57: A list of paths to E57 files.
        """

        def __init__(self) -> None:
            self.LAS: List[str] = []
            self.LAZ: List[str] = []
            self.PLY: List[str] = []
            self.E57: List[str] = []

    class Outputs:
        """
        Outputs for a Reality Conversion job.

        Attributes:
            OPC: Either a boolean to indicate conversion type or a list of created OPC files ids.
            cesium_point_cloud: Either a boolean to indicate conversion type or a list of created cesiumPointCloud files
                ids.
        """

        def __init__(self) -> None:
            self.OPC: Union[bool, List[str]] = False
            self.cesium_point_cloud: Union[bool, List[str]] = False


class RCJobCostParameters:
    """
    Parameters for estimating job cost before its processing.

    Estimated_cost is filled when this object is returned by a function but should only be taken in consideration if you
    have updated parameters for estimation before by using the get_job_estimated_cost function.

    Args:
        giga_pixels: Gigapixels to be processed.
        mega_points: Megapoints to be processed.
        estimated_cost: Estimated cost of the job.
    """

    def __init__(
        self,
        giga_pixels: float = 0.0,
        mega_points: float = 0.0,
        estimated_cost: float = 0.0,
    ):
        self.giga_pixels: float = giga_pixels
        self.mega_points: float = mega_points
        self.estimated_cost: float = estimated_cost

    def to_json(self) -> dict:
        """
        Transform job cost parameters into a dictionary compatible with json.
        Doesn't save estimated_cost because it is not a parameter used to estimate cost.

        Returns:
            Dictionary with cost parameters values.
        """
        json_dict = dict()
        if self.giga_pixels:
            json_dict["gigaPixels"] = self.giga_pixels
        if self.giga_pixels:
            json_dict["megaPoints"] = self.mega_points

        return json_dict

    @classmethod
    def from_json(cls, estimation_json: dict) -> ReturnValue[RCJobCostParameters]:
        """
        Transform json received from cloud service into job cost parameters.

        Args:
            estimation_json: Dictionary with estimation parameters received from cloud service.
        Returns:
            New RCJobCostEstimation object with actualized estimated cost.
        """
        new_estimation = cls()
        try:
            for k, v in estimation_json.items():
                if k == "gigaPixels":
                    new_estimation.giga_pixels = int(v)
                elif k == "megaPoints":
                    new_estimation.mega_points = float(v)
                elif k == "estimatedCost":
                    new_estimation.estimated_cost = float(v)
                else:
                    raise TypeError("found non expected cost estimation parameter:" + k)
        except (KeyError, TypeError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_estimation, error="")


class RCJobProperties(NamedTuple):
    """
    Properties of a job.
    Convenience class to stock all properties of a job in a simple way.
    """
    job_id: str = ""
    job_name: str = ""
    job_type: RCJobType = RCJobType.NONE
    job_state: JobState = JobState.UNKNOWN
    job_date_time: JobDateTime = JobDateTime()
    estimated_units: float = 0.0
    data_center: str = ""
    iTwin_id: str = ""
    email: str = ""
    job_settings: RCJobSettings = RCJobSettings()
    cost_estimation_parameters: RCJobCostParameters = RCJobCostParameters()
