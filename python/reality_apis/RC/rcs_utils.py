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
        merge: If true, all the input files from multiple containers will be merged into one output file. Else output
            file will be created per input file.
    """

    def __init__(self) -> None:
        self.inputs: RCJobSettings.Inputs = self.Inputs()
        self.outputs: RCJobSettings.Outputs = self.Outputs()
        self.engines: int = 0
        self.merge: bool = False

    def to_json(self) -> tuple[dict, dict, dict]:
        """
        Transform settings into a tuple of dictionaries compatible with json.

        Returns:
            Tuple of dictionaries with settings values. First dictionary has inputs, second has outputs and third holds
            options.
        """

        inputs_dict = {"inputs": list()}

        for rd_id in self.inputs.LAS:
            inputs_dict["inputs"].append({"id": rd_id})
        for rd_id in self.inputs.LAZ:
            inputs_dict["inputs"].append({"id": rd_id})
        for rd_id in self.inputs.PLY:
            inputs_dict["inputs"].append({"id": rd_id})
        for rd_id in self.inputs.E57:
            inputs_dict["inputs"].append({"id": rd_id})

        outputs_dict = {"outputs": list()}

        if self.outputs.OPC:
            outputs_dict["outputs"].append("OPC")
        if self.outputs.PNTS:
            outputs_dict["outputs"].append("PNTS")

        options_dict = {"options": {"processingEngines": self.engines, "merge": str(self.merge)}}

        return inputs_dict, outputs_dict, options_dict

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
            inputs_json = settings_json.get("inputs", [])
            for input_dict in inputs_json:
                if input_dict["type"] == "LAS":
                    new_job_settings.inputs.LAS.append(input_dict["id"])
                elif input_dict["type"] == "LAZ":
                    new_job_settings.inputs.LAZ.append(input_dict["id"])
                elif input_dict["type"] == "PLY":
                    new_job_settings.inputs.PLY.append(input_dict["id"])
                elif input_dict["type"] == "E57":
                    new_job_settings.inputs.E57.append(input_dict["id"])
                else:
                    raise TypeError(
                        "found non expected input type:" + input_dict["type"]
                    )

            outputs_json = settings_json.get("outputs", [])

            for output_dict in outputs_json:
                if output_dict["type"] == "OPC":
                    new_job_settings.outputs.OPC = []
                    new_job_settings.outputs.OPC.append(output_dict["id"])
                elif output_dict["type"] == "PNTS":
                    new_job_settings.outputs.PNTS = []
                    new_job_settings.outputs.PNTS.append(output_dict["id"])
                else:
                    raise TypeError(
                        "found non expected output type" + output_dict["type"]
                    )

            options_json = settings_json.get("options", {})
            new_job_settings.engines = int(options_json.get("processingEngines", 0))
            new_job_settings.merge = bool(options_json.get("merge", True))

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
            PNTS: Either a boolean to indicate conversion type or a list of created PNTS files ids.
        """

        def __init__(self) -> None:
            self.OPC: Union[bool, List[str]] = False
            self.PNTS: Union[bool, List[str]] = False


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
