# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

from __future__ import annotations
from enum import Enum
from typing import NamedTuple, List

from reality_apis.utils import ReturnValue, JobState, JobDateTime, iTwinCaptureWarning, iTwinCaptureError


class CCWorkspaceProperties(NamedTuple):
    """
    Properties of a workspace.
    Convenience class to stock all properties of a job in a simple way.
    """

    id: str = ""
    created_date_time: str = ""
    name: str = ""
    iTwin_id: str = ""
    context_capture_version: str = ""


class CCJobType(Enum):
    """
    Possible types of a Reality Modeling job.
    """

    NONE = "not recognized"
    FULL = "Full"
    CALIBRATION = "Calibration"
    RECONSTRUCTION = "Reconstruction"


class CCJobQuality(Enum):
    """
    Possible qualities of a Reality Modeling job.
    """

    UNKNOWN = "Unknown"
    DRAFT = "Draft"
    MEDIUM = "Medium"
    EXTRA = "Extra"


class CacheSettings:
    """
    Cache settings for a Reality Modeling Job.

    Attributes:
        create_cache: True if the job should produce a cache, False otherwise.
        use_cache: Id of the previous job cache to be reused.
    """

    def __init__(self) -> None:
        self.create_cache: bool = False
        self.use_cache: str = ""


class CCJobSettings:
    """
    Settings for Reality Modeling jobs.

    Attributes:
        inputs: Possible inputs for this job. Should be the ids of the inputs in the cloud.
        outputs: Possible outputs for this job. Fill the outputs you want for the job with a string (normally the name
            of the output) before passing the settings to create_job.
        mesh_quality: Quality of the mesh used.
        engines: Quantity of engines to be used by the job.
        cache_settings: Cache settings for the job.
    """

    def __init__(self) -> None:
        self.inputs: List[str] = []
        self.outputs: CCJobSettings.Outputs = self.Outputs()
        self.mesh_quality: CCJobQuality = CCJobQuality.UNKNOWN
        self.engines: int = 0
        self.cache_settings: CacheSettings = CacheSettings()

    def to_json(self) -> tuple[dict, dict]:
        """
        Transform settings into a tuple of dictionaries compatible with json.

        Returns:
            Tuple of dictionaries with settings values. The first dictionary has the settings and the second dictionary
            has the inputs, both as expected by the API.
        """
        cache = {}
        if self.cache_settings.create_cache:
            cache["createCache"] = str(self.cache_settings.create_cache)
        if self.cache_settings.use_cache != "":
            cache["useCache"] = self.cache_settings.use_cache
        input_dict = {"inputs": [{"id": i} for i in self.inputs]}
        settings_dict = {
            "settings": {
                "quality": self.mesh_quality.value,
                "processingEngines": self.engines,
                "outputs": list(),
            }
        }
        if cache:
            settings_dict["settings"]["cacheSettings"] = cache
        if self.outputs.context_scene:
            settings_dict["settings"]["outputs"].append("ContextScene")
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
        if self.outputs.omr:
            settings_dict["settings"]["outputs"].append("OMR")

        return settings_dict, input_dict

    @classmethod
    def from_json(cls, settings_inputs_json: dict) -> ReturnValue[CCJobSettings]:
        """
        Transform json received from cloud service into settings.

        Args:
            settings_inputs_json: Dictionary with settings and inputs received from cloud service.
        Returns:
            New settings object.
        """
        new_job_settings = cls()

        try:
            settings_json = settings_inputs_json.get("jobSettings", {})
            inputs_json = settings_inputs_json.get("inputs", [])

            new_job_settings.inputs = [i["id"] for i in inputs_json]

            outputs_list = settings_json.get("outputs", [])
            for output in outputs_list:
                if output["format"] == "ContextScene":
                    new_job_settings.outputs.context_scene = output["id"]
                elif output["format"] == "CCOrientations":
                    new_job_settings.outputs.ccorientation = output["id"]
                elif output["format"] == "3MX":
                    new_job_settings.outputs.threeMX = output["id"]
                elif output["format"] == "3SM":
                    new_job_settings.outputs.threeSM = output["id"]
                elif output["format"] == "WebReady ScalableMesh":
                    new_job_settings.outputs.web_ready_scalable_mesh = output["id"]
                elif output["format"] == "Cesium 3D Tiles":
                    new_job_settings.outputs.cesium_3D_tiles = output["id"]
                elif output["format"] == "POD":
                    new_job_settings.outputs.pod = output["id"]
                elif output["format"] == "Orthophoto/DSM":
                    new_job_settings.outputs.orthophoto_DSM = output["id"]
                elif output["format"] == "LAS":
                    new_job_settings.outputs.las = output["id"]
                elif output["format"] == "FBX":
                    new_job_settings.outputs.fbx = output["id"]
                elif output["format"] == "OBJ":
                    new_job_settings.outputs.obj = output["id"]
                elif output["format"] == "ESRI i3s":
                    new_job_settings.outputs.esri_i3s = output["id"]
                elif output["format"] == "DGN":
                    new_job_settings.outputs.dgn = output["id"]
                elif output["format"] == "LODTreeExport":
                    new_job_settings.outputs.lod_tree_export = output["id"]
                elif output["format"] == "PLY":
                    new_job_settings.outputs.ply = output["id"]
                elif output["format"] == "OPC":
                    new_job_settings.outputs.opc = output["id"]
                elif output["format"] == "OMR":
                    new_job_settings.outputs.omr = output["id"]
                else:
                    raise TypeError(
                        "found non expected output name:" + output["format"]
                    )
            new_job_settings.mesh_quality = CCJobQuality(settings_json.get("quality", "Unknown"))
            new_job_settings.engines = float(settings_json.get("processingEngines", 0))
            new_job_settings.cache_settings.use_cache = bool(
                settings_json.get("useCache", False)
            )
            new_job_settings.cache_settings.use_cache = settings_json.get(
                "useCache", ""
            )
        except (KeyError, TypeError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Outputs:
        """
        Possible outputs for a Reality Modeling job.

        Attributes:
            context_scene: Created context scene id.
            ccorientation: Created ccorientation id.
            threeMX: Created 3MX id.
            threeSM: Created 3SM id.
            web_ready_scalable_mesh: Created web ready scalable mesh id.
            cesium_3D_tiles: Created cesium 3D tiles id.
            pod: Created pod id.
            orthophoto_DSM: Created orthophoto dsm id.
            las: Created las id.
            fbx: Created fbx id.
            obj: Created obj id.
            esri_i3s: Created esri i3s id.
            dgn: Created dgn id.
            lod_tree_export: Created lod tree export id.
            ply: Created ply id.
            opc: Created opc id.
            omr: Created omr id.
        """

        def __init__(self) -> None:
            self.context_scene: str = ""
            self.ccorientation: str = ""
            self.threeMX: str = ""
            self.threeSM: str = ""
            self.web_ready_scalable_mesh: str = ""
            self.cesium_3D_tiles: str = ""
            self.pod: str = ""
            self.orthophoto_DSM: str = ""
            self.las: str = ""
            self.fbx: str = ""
            self.obj: str = ""
            self.esri_i3s: str = ""
            self.dgn: str = ""
            self.lod_tree_export: str = ""
            self.ply: str = ""
            self.opc: str = ""
            self.omr: str = ""


class CCJobCostParameters:
    """
    Parameters for estimating job cost before its processing.

    Args:
        giga_pixels: Gigapixels to be processed.
        mega_points: Megapoints to be processed.
        mesh_quality: Quality of the mesh.
    """

    def __init__(
        self,
        giga_pixels: float = 0.0,
        mega_points: float = 0.0,
        mesh_quality: CCJobQuality = CCJobQuality.UNKNOWN,
    ):
        self.giga_pixels: float = giga_pixels
        self.mega_points: float = mega_points
        self.mesh_quality: CCJobQuality = mesh_quality


class CCJobProperties(NamedTuple):
    """
    Properties of a Reality Modeling job.
    Convenience class to stock all properties of a job in a simple way.
    """

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
    errors: List[iTwinCaptureError] = []
    warnings: List[iTwinCaptureWarning] = []
