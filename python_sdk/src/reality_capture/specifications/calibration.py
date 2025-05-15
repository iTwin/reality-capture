from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class CalibrationInputs(BaseModel):
    scene: str = Field(description="Reality data ID of ContextScene to process")
    presets: Optional[list[str]] = Field(default=None, description="List of paths to preset")


class CalibrationOutputs(BaseModel):
    scene: str = Field(description="Reality data ID of calibrated ContextScene")
    report: Optional[str] = Field(default=None, description="Path in the bucket of Calibration report",
                                  pattern=r"^bkt:.+")
    splats: Optional[str] = Field(default=None, description="Reality data ID of Calibration Splats")


class CalibrationOutputsCreate(Enum):
    SCENE = "scene"
    REPORT = "report"
    SPLATS = "splats"


class RigSynchro(Enum):
    NO = "None"
    STRICT = "Strict"
    LOOSE = "Loose"


class RotationPolicy(Enum):
    COMPUTE = "Compute"
    ADJUST = "Adjust"
    KEEP = "Keep"


class CenterPolicy(Enum):
    COMPUTE = "Compute"
    ADJUST = "Adjust"
    ADJUST_WITHIN_TOLERANCE = "AdjustWithinTolerance"
    KEEP = "Keep"


class FocalPolicy(Enum):
    ADJUST = "Adjust"
    KEEP = "Keep"


class PrincipalPolicy(Enum):
    ADJUST = "Adjust"
    KEEP = "Keep"


class RadialPolicy(Enum):
    ADJUST = "Adjust"
    KEEP = "Keep"


class TangentialPolicy(Enum):
    ADJUST = "Adjust"
    KEEP = "Keep"


class FisheyeFocalPolicy(Enum):
    ADJUST_SYMMETRIC = "AdjustSymmetric"
    ADJUST_ASYMMETRIC = "AdjustAsymmetric"
    KEEP = "Keep"


class FisheyeDistortionPolicy(Enum):
    ADJUST_01XX0 = "Adjust_01xx0"
    ADJUST_X1XX0 = "Adjust_x1xx0"
    ADJUST_X1XXX = "Adjust_x1xxx"
    KEEP = "Keep"


class AspectRatioPolicy(Enum):
    ADJUST = "Adjust"
    KEEP = "Keep"


class SkewPolicy(Enum):
    ADJUST = "Adjust"
    KEEP = "Keep"


class TiepointsPolicy(Enum):
    COMPUTE = "Compute"
    ADJUST = "Adjust"
    KEEP = "Keep"


class PairSelection(Enum):
    DEFAULT = "Default"
    SEQUENCE = "Sequence"
    LOOP = "Loop"
    EXHAUSTIVE = "Exhaustive"
    SIMILARONLY = "SimilarOnly"


class KeypointsDensity(Enum):
    NORMAL = "Normal"
    HIGH = "High"


class Tag(Enum):
    QR = "QR"
    APRIL = "April"
    CHILI = "Chili"


class ColorEqualization(Enum):
    NO = "None"
    BLOCK_WISE = "BlockWise"


class AdjustmentConstraints(Enum):
    NO = "None"
    CONTROL_POINTS = "ControlPoints"
    POSITION_METADATA = "PositionMetadata"
    POINT_CLOUDS = "PointClouds"
    AUTOMATIC = "Automatic"


class RigidRegistrationPosition(Enum):
    NO = "None"
    USER_CONSTRAINTS = "UserConstraints"
    CONTROL_POINTS = "ControlPoints"
    POSITION_METADATA = "PositionMetadata"
    POINT_CLOUDS = "PointClouds"
    AUTOMATIC = "Automatic"


class RigidRegistrationRotation(Enum):
    NO = "None"
    USER_CONSTRAINTS = "UserConstraints"
    CONTROL_POINTS = "ControlPoints"
    POSITION_METADATA = "PositionMetadata"
    POINT_CLOUDS = "PointClouds"
    AUTOMATIC = "Automatic"
    ROTATION_METADATA = "RotationMetadata"


class RigidRegistrationScale(Enum):
    NO = "None"
    USER_CONSTRAINTS = "UserConstraints"
    CONTROL_POINTS = "ControlPoints"
    POSITION_METADATA = "PositionMetadata"
    POINT_CLOUDS = "PointClouds"
    AUTOMATIC = "Automatic"


class CalibrationOptions(BaseModel):
    rig_synchro: Optional[RigSynchro] = Field(default=None, description="Rig synchronization mode", alias="rigSynchro")
    rotation_policy: Optional[RotationPolicy] = Field(default=None, description="Rotation policy",
                                                      alias="rotationPolicy")
    center_policy: Optional[CenterPolicy] = Field(default=None, description="Center policy", alias="centerPolicy")
    center_tolerance: Optional[float] = Field(default=None,
                                              description="Center tolerance, use only when center policy is "
                                                          "AdjustWithinTolerance",
                                              alias="centerTolerance")
    focal_policy: Optional[FocalPolicy] = Field(default=None, description="Focal policy", alias="focalPolicy")
    principal_policy: Optional[PrincipalPolicy] = Field(default=None, description="Principal point policy",
                                                        alias="principalPolicy")
    radial_policy: Optional[RadialPolicy] = Field(default=None, description="Radial policy", alias="radialPolicy")
    tangential_policy: Optional[TangentialPolicy] = Field(default=None, description="Tangential policy",
                                                          alias="tangentialPolicy")
    fisheye_focal_policy: Optional[FisheyeFocalPolicy] = Field(default=None, description="Fisheye focal policy",
                                                               alias="fisheyeFocalPolicy")
    fisheye_distortion_policy: Optional[FisheyeDistortionPolicy] = Field(default=None,
                                                                         description="Fisheye distortion policy",
                                                                         alias="fisheyeDistortionPolicy")
    aspect_ratio_policy: Optional[AspectRatioPolicy] = Field(default=None, description="Aspect ratio policy",
                                                             alias="aspectRatioPolicy")
    skew_policy: Optional[SkewPolicy] = Field(default=None, description="Skew policy", alias="skewPolicy")
    tiepoints_policy: Optional[TiepointsPolicy] = Field(default=None, description="Tiepoints policy",
                                                        alias="tiepointsPolicy")
    pair_selection: Optional[PairSelection] = Field(default=None, description="Pair selection mode",
                                                    alias="pairSelection")
    pair_selection_distance: Optional[int] = Field(default=None,
                                                   description="Pair selection distance, use only when pair "
                                                               "selection mode is Sequence or Loop",
                                                   alias="pairSelectionDistance")
    keypoints_density: Optional[KeypointsDensity] = Field(default=None, description="Keypoints density",
                                                          alias="keypointsDensity")
    precalibration: Optional[bool] = Field(default=None, description="Enable precalibration")
    tags_extraction: Optional[list[Tag]] = Field(default=None, description="Tags to extract", alias="tagsExtraction")
    color_equalization: Optional[ColorEqualization] = Field(default=None, description="Color equalization mode",
                                                            alias="colorEqualization")
    adjustment_constraints: Optional[AdjustmentConstraints] = Field(default=None, description="Adjustment constraints",
                                                                    alias="adjustmentConstraints")
    rigid_registration_position: Optional[RigidRegistrationPosition] = Field(default=None,
                                                                             description="Rigid registration for position",
                                                                             alias="rigidRegistrationPosition")
    rigid_registration_rotation: Optional[RigidRegistrationRotation] = (
        Field(default=None,
              description="Rigid registration for rotation",
              alias="rigidRegistrationRotation"))
    rigid_registration_scale: Optional[RigidRegistrationScale] = Field(default=None,
                                                                       description="Rigid registration for scale",
                                                                       alias="RigidRegistrationScale")


class CalibrationSpecifications(BaseModel):
    inputs: CalibrationInputs = Field(description="Inputs for calibration")
    outputs: CalibrationOutputs = Field(description="Outputs for calibration")
    options: Optional[CalibrationOptions] = Field(None, description="Options for calibration")


class CalibrationSpecificationsCreate(BaseModel):
    inputs: CalibrationInputs = Field(description="Inputs for calibration")
    outputs: list[CalibrationOutputsCreate] = Field(description="List of outputs for calibration")
    options: Optional[CalibrationOptions] = Field(None, description="Options for calibration")


class CalibrationCost(BaseModel):
    gpix: float = Field(description="Number of GigaPixels in the overall inputs, after applying downsampling.", ge=0)
    mpoints: float = Field(description="Number of MegaPoints in the overall inputs.", ge=0)
