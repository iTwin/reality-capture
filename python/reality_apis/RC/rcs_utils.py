# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

from __future__ import annotations

from typing import NamedTuple
from reality_apis.RC.rcs_settings import JobSettings, ConversionSettings
from reality_apis.RC.rcs_enums import RCJobType
from reality_apis.utils import ReturnValue, JobState, JobDateTime


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
    job_settings: JobSettings = ConversionSettings()
    cost_estimation_parameters: RCJobCostParameters = RCJobCostParameters()
