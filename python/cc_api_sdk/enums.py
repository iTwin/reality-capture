from enum import Enum


class MeshQuality(str, Enum):
    """
    Quality of a reconstruction
    """
    DRAFT = "Draft"
    MEDIUM = "Medium"
    EXTRA = "Extra"

    @staticmethod
    def from_str(s: str):
        for x in MeshQuality:
            if s == x.value:
                return x

class JobType(str, Enum):
    """
    Type of job
    """
    FULL = "Full"
    CALIBRATION = "Calibration"
    RECONSTRUCTION = "Reconstruction"

    @staticmethod
    def from_str(s: str):
        for x in JobType:
            if s == x.value:
                return x

class Format(str, Enum):
    """
    Possible output formats
    """
    THREEMX = "3MX"
    THREESM = "3SM"
    CC_ORIENTATIONS = "CCOrientations"
    WEB_SCALABLE_MESH = "WebReady ScalableMesh"
    CESIUM_3D_TILES = "Cesium 3D Tiles"
    POD = "POD"
    ORTHO_DSM = "Orthophoto/DSM"
    LAS = "LAS"
    FBX = "FBX"
    OBJ = "OBJ"
    ESRI_I3S = "ESRI i3s"
    DGN = "DGN"
    LOD_TREE_Export = "LODTreeExport"

    @staticmethod
    def from_str(s: str):
        for x in Format:
            if s == x.value:
                return x

class JobState(str, Enum):
    NEW = "New"
    ACTIVE = "Active"
    COMPLETED = "Completed"

    @staticmethod
    def from_str(s: str):
        for x in JobState:
            if s == x.value:
                return x

class JobOutcome(str, Enum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

    @staticmethod
    def from_str(s: str):
        for x in JobOutcome:
            if s == x.value:
                return x

class AccessStatus(Enum):
    """
    Describe the level of access of a user to ContextCapture API
    """
    WHITELISTED = 1
    ALLOWED = 2
    ALLOWED_EVALUATION = 3
    UNKNOWN = 4
    NO_LICENSE = 5
    DENIED = 6
    DENIED_TRIAL = 7
    ALLOWED_TRIAL = 8

    @staticmethod
    def from_str(s: str):
        for x in AccessStatus:
            if s == x.value:
                return x
