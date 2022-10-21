from __future__ import annotations
from enum import Enum
from typing import NamedTuple

from sdk.utils import ReturnValue, JobState, JobDateTime


class CCWorkspaceProperties(NamedTuple):
    work_id: str = ""
    created_date_time: str = ""
    work_name: str = ""
    iTwin_id: str = ""
    context_capture_version: str = ""


class CCJobType(Enum):
    NONE = "not recognized"
    FULL = "Full"
    CALIBRATION = "Calibration"
    RECONSTRUCTION = "Reconstruction"


class CCJobQuality(Enum):
    UNKNOWN = "Unknown"
    DRAFT = "Draft"
    MEDIUM = "Medium"
    EXTRA = "Extra"


class CacheSettings:
    def __init__(self) -> None:
        self.create_cache = False
        self.use_cache = ""


class CCJobSettings:
    def __init__(self) -> None:
        self.inputs = []
        self.outputs = self.Outputs()
        self.quality = CCJobQuality.UNKNOWN
        self.engines = 0
        self.cache_settings = CacheSettings()

    def to_json(self) -> tuple[dict, dict]:
        cache = {}
        if self.cache_settings.create_cache:
            cache["createCache"] = str(self.cache_settings.create_cache)
        if self.cache_settings.use_cache != "":
            cache["useCache"] = self.cache_settings.use_cache
        input_dict = {
            "inputs": [{
                "id": i
            } for i in self.inputs]
        }
        settings_dict = {"settings": {
            "meshQuality": self.quality.value,
            "processingEngines": self.engines,
            "outputs": list()
            }
        }
        if cache:
            settings_dict["settings"]["cacheSettings"] = cache
        if self.outputs.context_scene:
            settings_dict["settings"]["outputs"].append("contextScene")
        if self.outputs.ccorientation:
            settings_dict["settings"]["outputs"].append("CCOrientations")
        if self.outputs.threeMX:
            settings_dict["settings"]["outputs"].append("3MX")
        if self.outputs.threeSM:
            settings_dict["settings"]["outputs"].append("3SM")
        if self.outputs.web_ready_scalable_mesh:
            settings_dict["settings"]["outputs"].append("WebReady ScalableMesh")
        if self.outputs.cesium_3D_tiles:
            settings_dict["settings"]["outputs"].append("Cesium 3D Tiles")
        if self.outputs.pod:
            settings_dict["settings"]["outputs"].append("POD")
        if self.outputs.orthophoto_DSM:
            settings_dict["settings"]["outputs"].append("Orthophoto/DSM")
        if self.outputs.las:
            settings_dict["settings"]["outputs"].append("LAS")
        if self.outputs.fbx:
            settings_dict["settings"]["outputs"].append("FBX")
        if self.outputs.obj:
            settings_dict["settings"]["outputs"].append("OBJ")
        if self.outputs.esri_i3s:
            settings_dict["settings"]["outputs"].append("ESRI i3s")
        if self.outputs.dgn:
            settings_dict["settings"]["outputs"].append("DGN")
        if self.outputs.lod_tree_export:
            settings_dict["settings"]["outputs"].append("LODTreeExport")
        if self.outputs.ply:
            settings_dict["settings"]["outputs"].append("PLY")
        if self.outputs.opc:
            settings_dict["settings"]["outputs"].append("OPC")

        return settings_dict, input_dict

    @classmethod
    def from_json(cls, settings_json: dict, inputs_json: dict) -> ReturnValue[CCJobSettings]:
        new_job_settings = cls()
        try:
            new_job_settings.inputs = [i["id"] for i in inputs_json]
            outputs_list = settings_json["outputs"]
            for output in outputs_list:
                if output["format"] == "contextScene":
                    new_job_settings.outputs.context_scene = output["realityDataId"]
                elif output["format"] == "CCOrientations":
                    new_job_settings.outputs.ccorientation = output["CCOrientations"]
                elif output["format"] == "3MX":
                    new_job_settings.outputs.threeMX = output["3MX"]
                elif output["format"] == "3SM":
                    new_job_settings.outputs.threeSM = output["3SM"]
                elif output["format"] == "WebReady ScalableMesh":
                    new_job_settings.outputs.web_ready_scalable_mesh = output["WebReady ScalableMesh"]
                elif output["format"] == "Cesium 3D Tiles":
                    new_job_settings.outputs.cesium_3D_tiles = output["Cesium 3D Tiles"]
                elif output["format"] == "POD":
                    new_job_settings.outputs.pod = output["POD"]
                elif output["format"] == "Orthophoto/DSM":
                    new_job_settings.outputs.orthophoto_DSM = output["Orthophoto/DSM"]
                elif output["format"] == "LAS":
                    new_job_settings.outputs.las = output["LAS"]
                elif output["format"] == "FBX":
                    new_job_settings.outputs.fbx = output["FBX"]
                elif output["format"] == "OBJ":
                    new_job_settings.outputs.obj = output["OBJ"]
                elif output["format"] == "ESRI i3s":
                    new_job_settings.outputs.esri_i3s = output["ESRI i3s"]
                elif output["format"] == "DGN":
                    new_job_settings.outputs.dgn = output["DGN"]
                elif output["format"] == "LODTreeExport":
                    new_job_settings.outputs.lod_tree_export = output["LODTreeExport"]
                elif output["format"] == "PLY":
                    new_job_settings.outputs.ply = output["PLY"]
                elif output["format"] == "OPC":
                    new_job_settings.outputs.opc = output["OPC"]
                else:
                    raise TypeError(
                        "found non expected output name:", output["format"])
            new_job_settings.quality = CCJobQuality(settings_json["meshQuality"])
            new_job_settings.engines = float(settings_json["processingEngines"])
            new_job_settings.cache_settings.use_cache = bool(settings_json["useCache"].get("useCache", False))
            new_job_settings.cache_settings.use_cache = settings_json["cacheSettings"].get("useCache", "")
        except (KeyError, TypeError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Outputs:
        def __init__(self) -> None:
            self.context_scene = ""
            self.ccorientation = ""
            self.threeMX = ""
            self.threeSM = ""
            self.web_ready_scalable_mesh = ""
            self.cesium_3D_tiles = ""
            self.pod = ""
            self.orthophoto_DSM = ""
            self.las = ""
            self.fbx = ""
            self.obj = ""
            self.esri_i3s = ""
            self.dgn = ""
            self.lod_tree_export = ""
            self.ply = ""
            self.opc = ""


class CCJobCostParameters:

    def __init__(self, giga_pixels: float = 0.0, mega_points: float = 0.0, mesh_quality: CCJobQuality = CCJobQuality.UNKNOWN):
        self.giga_pixels = giga_pixels
        self.mega_points = mega_points
        self.mesh_quality = mesh_quality


class CCJobProperties(NamedTuple):

    job_id: str = ""
    job_name: str = ""
    job_type: CCJobType = CCJobType.NONE
    job_state: JobState = JobState.UNKNOWN
    job_date_time: JobDateTime = JobDateTime()
    iTwin_id: str = ""
    location: str = ""
    email: str = ""
    work_id: str = ""
    estimated_units: float = 0.0
    job_settings: CCJobSettings = CCJobSettings()
    cost_estimation_parameters: CCJobCostParameters = CCJobCostParameters()
    estimated_cost: float = 0.0
