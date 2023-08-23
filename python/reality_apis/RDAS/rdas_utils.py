# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

from __future__ import annotations
from typing import NamedTuple, List
from reality_apis.RDAS.job_settings import JobSettings, O2DJobSettings
from reality_apis.RDAS.rdas_enums import RDAJobType
from reality_apis.utils import ReturnValue, JobState, JobDateTime, iTwinCaptureWarning, iTwinCaptureError


class RDAJobCostParameters:
    """
    Parameters for estimating job cost before its processing.

    Estimated_cost is filled when this object is returned by a function but should only be taken in consideration if you
    have updated parameters for estimation before by using the get_job_estimated_cost function.

    Args:
        giga_pixels: Number of giga pixels in inputs.
        number_photos: Number of photos in inputs.
        scene_width: Width of the scene.
        scene_height: Height of the scene.
        scene_length: Length of the scene.
        detector_scale: Scale of the detector.
        detector_cost: Cost of the detector.
        estimated_cost: Estimated cost of the detector.
    """

    def __init__(
        self,
        giga_pixels: float = 0.0,
        number_photos: int = 0,
        scene_width: float = 0.0,
        scene_height: float = 0.0,
        scene_length: float = 0.0,
        detector_scale: float = 0.0,
        detector_cost: float = 0.0,
        estimated_cost: float = 0.0,
    ) -> None:

        self.giga_pixels = giga_pixels
        self.number_photos = number_photos
        self.scene_width = scene_width
        self.scene_height = scene_height
        self.scene_length = scene_length
        self.detector_scale = detector_scale
        self.detector_cost = detector_cost
        self.estimated_cost = estimated_cost

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
        if self.number_photos:
            json_dict["numberOfPhotos"] = self.number_photos
        if self.scene_width:
            json_dict["sceneWidth"] = self.scene_width
        if self.scene_height:
            json_dict["sceneHeight"] = self.scene_height
        if self.scene_length:
            json_dict["sceneLength"] = self.scene_length
        if self.detector_scale:
            json_dict["detectorScale"] = self.detector_scale
        if self.detector_cost:
            json_dict["detectorCost"] = self.detector_cost
        return json_dict

    @classmethod
    def from_json(cls, estimation_json: dict) -> ReturnValue[RDAJobCostParameters]:
        """
        Transform json received from cloud service into job cost parameters.

        Args:
            estimation_json: Dictionary with estimation parameters received from cloud service.
        Returns:
            New JobCostEstimation object with actualized estimated cost.
        """
        new_estimation = cls()
        try:
            for k, v in estimation_json.items():
                if k == "gigaPixels":
                    new_estimation.giga_pixels = int(v)
                elif k == "numberOfPhotos":
                    new_estimation.number_photos = float(v)
                elif k == "sceneWidth":
                    new_estimation.scene_width = float(v)
                elif k == "sceneHeight":
                    new_estimation.scene_height = float(v)
                elif k == "sceneLength":
                    new_estimation.scene_length = float(v)
                elif k == "detectorScale":
                    new_estimation.detector_scale = float(v)
                elif k == "detectorCost":
                    new_estimation.detector_cost = float(v)
                elif k == "estimatedCost":
                    new_estimation.estimated_cost = float(v)
                else:
                    raise TypeError("found non expected cost estimation parameter:" + k)
        except (KeyError, TypeError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_estimation, error="")


class RDAJobProperties(NamedTuple):
    """
    Properties of a job.
    Convenience class to stock all properties of a job in a simple way.
    """

    job_type: RDAJobType = RDAJobType.NONE
    job_settings: JobSettings = O2DJobSettings()
    cost_estimation_parameters: RDAJobCostParameters = RDAJobCostParameters()
    job_date_time: JobDateTime = JobDateTime()
    job_state: JobState = JobState.UNKNOWN
    estimated_units: float = 0.0
    exit_code: int = 0
    job_id: str = ""
    job_name: str = ""
    iTwin_id: str = ""
    data_center: str = ""
    email: str = ""
    errors: List[iTwinCaptureError] = []
    warnings: List[iTwinCaptureWarning] = []
