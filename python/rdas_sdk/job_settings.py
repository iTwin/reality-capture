from __future__ import annotations

from typing import TypeVar
from rdas_sdk.utils import JobType, ReturnValue


class O2DJobSettings:
    """
    Settings for Object Detection 2D jobs
    """

    def __init__(self) -> None:
        self.type = JobType.O2D
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()

    def to_json(self) -> dict:
        json_dict = {}
        json_dict["inputs"] = []
        if self.inputs.photos:
            json_dict["inputs"].append({"name": "photos", "realityDataId": self.inputs.photos})
        if self.inputs.photo_object_detector:
            json_dict["inputs"].append({"name": "photoObjectDetector", "realityDataId": self.inputs.photo_object_detector})
        json_dict["outputs"] = []
        if self.outputs.objects2D:
            json_dict["outputs"].append("objects2D")
        return json_dict

    @classmethod
    def from_json(cls, settings_json: dict) -> ReturnValue[O2DJobSettings]:
        new_job_settings = cls()
        try:
            inputs_json = settings_json["inputs"]
            for input_dict in inputs_json:
                if input_dict["name"] == "photos":
                    new_job_settings.inputs.photos = input_dict["realityDataId"]
                elif input_dict["name"] == "photoObjectDetector":
                    new_job_settings.inputs.photo_object_detector = input_dict["realityDataId"]
                else:
                    raise TypeError("found non expected input name")
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["name"] == "objects2D":
                    new_job_settings.outputs.objects2D = output_dict["realityDataId"]
                else:
                    raise TypeError("found non expected output name")
        except (KeyError, TypeError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        def __init__(self) -> None:
            self.photos: str = ""
            self.photo_object_detector: str = ""

    class Outputs:
        def __init__(self) -> None:
            self.objects2D: str = ""


class S2DJobSettings:
    """
    Settings for Segmentation 2D jobs
    """

    def __init__(self) -> None:
        self.type = JobType.S2D
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()

    def to_json(self) -> dict:
        json_dict = {}
        json_dict["inputs"] = []
        if self.inputs.photos:
            json_dict["inputs"].append({"name": "photos", "realityDataId": self.inputs.photos})
        if self.inputs.photo_segmentation_detector:
            json_dict["inputs"].append({"name": "photoSegmentationDetector", "realityDataId": self.inputs.photo_segmentation_detector})
        if self.inputs.orthophoto:
            json_dict["inputs"].append({"name": "photos""orthophoto", "realityDataId": self.inputs.orthophoto})
        if self.inputs.orthophoto_segmentation_detector:
            json_dict["inputs"].append({"name": "orthophotoSegmentationDetector", "realityDataId": self.inputs.orthophoto_segmentation_detector})
        json_dict["outputs"] = []
        if self.outputs.segmentation2D:
            json_dict["outputs"].append("segmentation2D")
        if self.outputs.segmented_photos:
            json_dict["outputs"].append("segmentedPhotos")
        if self.outputs.polygons2D:
            json_dict["outputs"].append("polygons2D")
        if self.outputs.exported_polygons2D_SHP:
            json_dict["outputs"].append("exportedPolygons2DSHP")
        if self.outputs.lines2D:
            json_dict["outputs"].append("lines2D")
        return json_dict

    @classmethod
    def from_json(cls, settings_json: dict) -> ReturnValue[S2DJobSettings]:
        new_job_settings = cls()
        try:
            inputs_json = settings_json["inputs"]
            for input_dict in inputs_json:
                if input_dict["name"] == "photos":
                    new_job_settings.inputs.photos = input_dict["realityDataId"]
                elif input_dict["name"] == "photoObjectDetector":
                    new_job_settings.inputs.photo_object_detector = input_dict["realityDataId"]
                elif input_dict["name"] == "orthophoto":
                    new_job_settings.inputs.orthophoto = input_dict["realityDataId"]
                elif input_dict["name"] == "orthophotoSegmentationDetector":
                    new_job_settings.inputs.orthophoto_segmentation_detector = input_dict["realityDataId"]
                else:
                    raise TypeError("found non expected input name")
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["name"] == "segmentation2D":
                    new_job_settings.outputs.segmentation2D = output_dict["realityDataId"]
                elif output_dict["name"] == "segmentedPhotos":
                    new_job_settings.outputs.segmented_photos = output_dict["realityDataId"]
                elif output_dict["name"] == "polygons2D":
                    new_job_settings.outputs.polygons2D = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedPolygons2DSHP":
                    new_job_settings.outputs.exported_polygons2D_SHP = output_dict["realityDataId"]
                elif output_dict["name"] == "lines2D":
                    new_job_settings.outputs.lines2D = output_dict["realityDataId"]
                else:
                    raise TypeError("found non expected output name")
        except (TypeError, KeyError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        def __init__(self) -> None:
            self.photos: str = ""
            self.photo_segmentation_detector: str = ""
            self.orthophoto: str = ""
            self.orthophoto_segmentation_detector: str = ""

    class Outputs:
        def __init__(self) -> None:
            self.segmentation2D: str = ""
            self.segmented_photos: str = ""
            self.polygons2D: str = ""
            self.exported_polygons2D_SHP: str = ""
            self.lines2D: str = ""


class O3DJobSettings:
    """
    Settings for Object Detection 3D jobs
    """

    def __init__(self) -> None:
        self.type = JobType.O3D
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()
        self.use_tie_points: bool = False
        self.min_photos: int = 0
        self.max_dist: float = 0.
        self.export_srs: str = ""

    def to_json(self) -> dict:
        json_dict = {}
        json_dict["inputs"] = []
        if self.inputs.oriented_photos:
            json_dict["inputs"].append({"name": "orientedPhotos", "realityDataId": self.inputs.oriented_photos})
        if self.inputs.photo_object_detector:
            json_dict["inputs"].append({"name": "photoObjectDetector", "realityDataId": self.inputs.photo_object_detector})
        if self.inputs.objects2D:
            json_dict["inputs"].append({"name": "objects2D", "realityDataId": self.inputs.objects2D})
        if self.inputs.point_clouds:
            json_dict["inputs"].append({"name": "pointClouds", "realityDataId": self.inputs.point_clouds})
        json_dict["outputs"] = []
        if self.outputs.objects2D:
            json_dict["outputs"].append("objects3D")
        if self.inputs.photo_object_detector:
            json_dict["outputs"].append("objects2D")
        if self.outputs.exported_objects3D_DGN:
            json_dict["outputs"].append("exportedObjects3DDGN")
        if self.outputs.exported_objects3D_cesium:
            json_dict["outputs"].append("exportedObjects3DCesium")
        if self.outputs.exported_locations3D_SHP:
            json_dict["outputs"].append("exportedLocations3DSHP")
        if self.use_tie_points:
            json_dict["UseTiePoints"] = "true"
        if self.min_photos:
            json_dict["MinPhotos"] = str(self.min_photos)
        if self.max_dist:
            json_dict["MaxDist"] = str(self.max_dist)
        if self.export_srs:
            json_dict["exportSrs"] = self.export_srs
        return json_dict

    @classmethod
    def from_json(cls, settings_json: dict) -> ReturnValue[O3DJobSettings]:
        new_job_settings = cls()
        try:
            inputs_json = settings_json["inputs"]
            for input_dict in inputs_json:
                if input_dict["name"] == "orientedPhotos":
                    new_job_settings.inputs.oriented_photos = input_dict["realityDataId"]
                elif input_dict["name"] == "photoObjectDetector":
                    new_job_settings.inputs.photo_object_detector = input_dict["realityDataId"]
                elif input_dict["name"] == "pointClouds":
                    new_job_settings.inputs.point_clouds = input_dict["realityDataId"]
                elif input_dict["name"] == "objects2D":
                    new_job_settings.inputs.objects2D = input_dict["realityDataId"]
                else:
                    raise TypeError("found non expected input name")
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["name"] == "objects2D":
                    new_job_settings.outputs.objects2D = output_dict["realityDataId"]
                if output_dict["name"] == "objects3D":
                    new_job_settings.outputs.objects3D = output_dict["realityDataId"]
                if output_dict["name"] == "exportedObjects3DDGN":
                    new_job_settings.outputs.exported_objects3D_DGN = output_dict["realityDataId"]
                if output_dict["name"] == "exportedObjects3DCesium":
                    new_job_settings.outputs.exported_objects3D_cesium = output_dict["realityDataId"]
                if output_dict["name"] == "exportedLocations3DSHP":
                    new_job_settings.outputs.exported_locations3D_SHP = output_dict["realityDataId"]
                else:
                    raise TypeError("found non expected output name")
            if "exportSrs" in settings_json:
                new_job_settings.export_srs = settings_json["exportSrs"]
            if "minPhotos" in settings_json:
                new_job_settings.min_photos = int(settings_json["minPhotos"])
            if "maxDist" in settings_json:
                new_job_settings.max_dist = float(settings_json["maxDist"])
            if "useTiePoints" in settings_json:
                new_job_settings.use_tie_points = bool(settings_json["useTiePoints"])
        except (KeyError, TypeError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        def __init__(self) -> None:
            self.oriented_photos: str = ""
            self.point_clouds: str = ""
            self.photo_object_detector: str = ""
            self.objects2D: str = ""

    class Outputs:
        def __init__(self) -> None:
            self.objects2D: str = ""
            self.objects3D: str = ""
            self.exported_objects3D_DGN: str = ""
            self.exported_objects3D_cesium: str = ""
            self.exported_locations3D_SHP: str = ""


class S3DJobSettings:
    """
    Settings for Segmentation 3D jobs
    """

    def __init__(self) -> None:
        self.type = JobType.S3D
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()
        self.save_confidence: bool = False
        self.export_srs: str = ""

    def to_json(self) -> dict:
        json_dict = {}
        json_dict["inputs"] = []
        if self.inputs.point_clouds:
            json_dict["inputs"].append({"name": "pointClouds", "realityDataId": self.inputs.point_clouds})
        if self.inputs.meshes:
            json_dict["inputs"].append({"name": "meshes", "realityDataId": self.inputs.meshes})
        if self.inputs.point_cloud_segmentation_detector:
            json_dict["inputs"].append({"name": "pointCloudSegmentationDetector", "realityDataId": self.inputs.point_cloud_segmentation_detector})
        if self.inputs.segmentation3D:
            json_dict["inputs"].append({"name": "segmentation3D", "realityDataId": self.inputs.segmentation3D})
        if self.inputs.oriented_photos:
            json_dict["inputs"].append({"name": "orientedPhotos", "realityDataId": self.inputs.oriented_photos})
        if self.inputs.photo_object_detector:
            json_dict["inputs"].append({"name": "photoObjectDetector", "realityDataId": self.inputs.photo_object_detector})
        if self.inputs.objects2D:
            json_dict["inputs"].append({"name": "objects2D", "realityDataId": self.inputs.objects2D})
        json_dict["outputs"] = []
        if self.outputs.segmentation3D:
            json_dict["outputs"].append("segmentation3D")
        if self.outputs.segmented_point_cloud:
            json_dict["outputs"].append("segmentedPointCloud")
        if self.outputs.objects2D:
            json_dict["outputs"].append("objects2D")
        if self.outputs.exported_segmentation3D_POD:
            json_dict["outputs"].append("exportedSegmentation3DPOD")
        if self.outputs.exported_segmentation3D_LAS:
            json_dict["outputs"].append("exportedSegmentation3DLAS")
        if self.outputs.exported_segmentation3D_LAZ:
            json_dict["outputs"].append("exportedSegmentation3DLAZ")
        if self.outputs.exported_segmentation3D_PLY:
            json_dict["outputs"].append("exportedSegmentation3DPLY")
        if self.outputs.objects3D:
            json_dict["outputs"].append("objects3D")
        if self.outputs.exported_objects3D_DGN:
            json_dict["outputs"].append("exportedObjects3DDGN")
        if self.outputs.exported_objects3D_cesium:
            json_dict["outputs"].append("exportedObjects3DCesium")
        if self.outputs.exported_locations3D_SHP:
            json_dict["outputs"].append("exportedLocations3DSHP")
        if self.export_srs:
            json_dict["exportSrs"] = self.export_srs
        if self.save_confidence:
            json_dict["saveConfidence"] = "true"
        return json_dict

    @classmethod
    def from_json(cls, settings_json: dict) -> ReturnValue[S3DJobSettings]:
        new_job_settings = cls()
        try:
            inputs_json = settings_json["inputs"]
            for input_dict in inputs_json:
                if input_dict["name"] == "pointClouds":
                    new_job_settings.inputs.point_clouds = input_dict["realityDataId"]
                elif input_dict["name"] == "meshes":
                    new_job_settings.inputs.meshes = input_dict["realityDataId"]
                elif input_dict["name"] == "pointCloudSegmentationDetector":
                    new_job_settings.inputs.point_cloud_segmentation_detector = input_dict["realityDataId"]
                elif input_dict["name"] == "segmentation3D":
                    new_job_settings.inputs.segmentation3D = input_dict["realityDataId"]
                elif input_dict["name"] == "orientedPhotos":
                    new_job_settings.inputs.oriented_photos = input_dict["realityDataId"]
                elif input_dict["name"] == "photoObjectDetector":
                    new_job_settings.inputs.photo_object_detector = input_dict["realityDataId"]
                elif input_dict["name"] == "objects2D":
                    new_job_settings.inputs.objects2D = input_dict["realityDataId"]
                else:
                    raise TypeError("found non expected input name")
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["name"] == "segmentation3D":
                    new_job_settings.outputs.segmentation3D = output_dict["realityDataId"]
                elif output_dict["name"] == "segmentedPointCloud":
                    new_job_settings.outputs.segmented_point_cloud = output_dict["realityDataId"]
                elif output_dict["name"] == "objects2D":
                    new_job_settings.outputs.objects2D = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedSegmentation3DPOD":
                    new_job_settings.outputs.exported_segmentation3D_POD = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedSegmentation3DLAS":
                    new_job_settings.outputs.exported_segmentation3D_LAS = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedSegmentation3DLAZ":
                    new_job_settings.outputs.exported_segmentation3D_LAZ = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedSegmentation3DPLY":
                    new_job_settings.outputs.exported_segmentation3D_PLY = output_dict["realityDataId"]
                elif output_dict["name"] == "objects3D":
                    new_job_settings.outputs.objects3D = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedObjects3DDGN":
                    new_job_settings.outputs.exported_objects3D_DGN = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedObjects3DCesium":
                    new_job_settings.outputs.exported_objects3D_cesium = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedLocations3DSHP":
                    new_job_settings.outputs.exported_locations3D_SHP = output_dict["realityDataId"]
                else:
                    raise TypeError("found non expected output name")
            if "saveConfidence" in settings_json:
                new_job_settings.save_confidence = bool(settings_json["saveConfidence"])
            if "exportSrs" in settings_json:
                new_job_settings.export_srs = settings_json["exportSrs"]
        except (KeyError, TypeError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        def __init__(self) -> None:
            self.point_clouds: str = ""
            self.meshes: str = ""
            self.point_cloud_segmentation_detector: str = ""
            self.segmentation3D: str = ""
            self.oriented_photos: str = ""
            self.photo_object_detector: str = ""
            self.objects2D: str = ""

    class Outputs:
        def __init__(self) -> None:
            self.segmentation3D: str = ""
            self.segmented_point_cloud: str = ""
            self.objects2D: str = ""
            self.exported_segmentation3D_POD: str = ""
            self.exported_segmentation3D_LAS: str = ""
            self.exported_segmentation3D_LAZ: str = ""
            self.exported_segmentation3D_PLY: str = ""
            self.objects3D: str = ""
            self.exported_objects3D_DGN: str = ""
            self.exported_objects3D_cesium: str = ""
            self.exported_locations3D_SHP: str = ""


class L3DJobSettings:
    """
    Settings for Line Detection 3D jobs
    """

    def __init__(self) -> None:
        self.type = JobType.L3D
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()
        self.compute_line_width: bool = False
        self.remove_small_components: float = 0.
        self.export_srs: str = ""

    def to_json(self) -> dict:
        json_dict = {}
        json_dict["inputs"] = []
        if self.inputs.point_clouds:
            json_dict["inputs"].append({"name": "pointClouds", "realityDataId": self.inputs.point_clouds})
        if self.inputs.meshes:
            json_dict["inputs"].append({"name": "meshes", "realityDataId": self.inputs.meshes})
        if self.inputs.point_cloud_segmentation_detector:
            json_dict["inputs"].append({"name": "pointCloudSegmentationDetector", "realityDataId": self.inputs.point_cloud_segmentation_detector})
        if self.inputs.segmentation3D:
            json_dict["inputs"].append({"name": "segmentation3D", "realityDataId": self.inputs.segmentation3D})
        if self.inputs.oriented_photos:
            json_dict["inputs"].append({"name": "orientedPhotos", "realityDataId": self.inputs.oriented_photos})
        if self.inputs.photo_segmentation_detector:
            json_dict["inputs"].append({"name": "photoSegmentationDetector", "realityDataId": self.inputs.photo_segmentation_detector})
        if self.inputs.segmentation2D:
            json_dict["inputs"].append({"name": "segmentation2D", "realityDataId": self.inputs.segmentation2D})
        json_dict["outputs"] = []
        if self.outputs.segmentation3D:
            json_dict["outputs"].append({"name": "segmentation3D", "realityDataId": self.outputs.segmentation3D})
        if self.outputs.segmented_point_cloud:
            json_dict["outputs"].append({"name": "segmentedPointCloud", "realityDataId": self.outputs.segmented_point_cloud})
        if self.outputs.segmentation2D:
            json_dict["outputs"].append({"name": "segmentation2D", "realityDataId": self.outputs.segmentation2D})
        if self.outputs.segmented_photos:
            json_dict["outputs"].append({"name": "segmentedPhotos", "realityDataId": self.outputs.segmented_photos})
        if self.outputs.lines3D:
            json_dict["outputs"].append({"name": "lines3D", "realityDataId": self.outputs.lines3D})
        if self.outputs.exported_lines3D_DGN:
            json_dict["outputs"].append({"name": "exportedLines3DDGN", "realityDataId": self.outputs.exported_lines3D_DGN})
        if self.outputs.exported_lines3D_cesium:
            json_dict["outputs"].append({"name": "exportedLines3DCesium", "realityDataId": self.outputs.exported_lines3D_cesium})
        if self.compute_line_width:
            json_dict["computeLineWidth"] = "true"
        if self.remove_small_components:
            json_dict["removeSmallComponents"] = str(self.remove_small_components)
        if self.export_srs:
            json_dict["exportSrs"] = self.export_srs
        return json_dict

    @classmethod
    def from_json(cls, settings_json: dict) -> ReturnValue[L3DJobSettings]:
        new_job_settings = cls()
        try:
            inputs_json = settings_json["inputs"]
            for input_dict in inputs_json:
                if input_dict["name"] == "pointClouds":
                    new_job_settings.inputs.point_clouds = input_dict["realityDataId"]
                elif input_dict["name"] == "meshes":
                    new_job_settings.inputs.meshes = input_dict["realityDataId"]
                elif input_dict["name"] == "pointCloudSegmentationDetector":
                    new_job_settings.inputs.point_cloud_segmentation_detector = input_dict["realityDataId"]
                elif input_dict["name"] == "segmentation3D":
                    new_job_settings.inputs.segmentation3D = input_dict["realityDataId"]
                elif input_dict["name"] == "orientedPhotos":
                    new_job_settings.inputs.oriented_photos = input_dict["realityDataId"]
                elif input_dict["name"] == "photoSegmentationDetector":
                    new_job_settings.inputs.photo_segmentation_detector = input_dict["realityDataId"]
                elif input_dict["name"] == "segmentation2D":
                    new_job_settings.inputs.segmentation2D = input_dict["realityDataId"]
                else:
                    raise TypeError("found non expected input name")
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["name"] == "segmentation3D":
                    new_job_settings.outputs.segmentation3D = output_dict["realityDataId"]
                elif output_dict["name"] == "segmentedPointCloud":
                    new_job_settings.outputs.segmented_point_cloud = output_dict["realityDataId"]
                elif output_dict["name"] == "segmentation2D":
                    new_job_settings.outputs.segmentation2D = output_dict["realityDataId"]
                elif output_dict["name"] == "segmentedPhotos":
                    new_job_settings.outputs.segmented_photos = output_dict["realityDataId"]
                elif output_dict["name"] == "lines3D":
                    new_job_settings.outputs.lines3D = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedLines3DDGN":
                    new_job_settings.outputs.exported_lines3D_DGN = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedLines3DCesium":
                    new_job_settings.outputs.exported_lines3D_cesium = output_dict["realityDataId"]
                else:
                    raise TypeError("found non expected output name")
            if "computeLineWidth" in settings_json:
                new_job_settings.compute_line_width = bool(settings_json["computeLineWidth"])
            if "removeSmallComponents" in settings_json:
                new_job_settings.remove_small_components = float(settings_json["removeSmallComponents"])
            if "exportSrs" in settings_json:
                new_job_settings.export_srs = settings_json["exportSrs"]
        except (KeyError, TypeError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        def __init__(self) -> None:
            self.point_clouds: str = ""
            self.meshes: str = ""
            self.point_cloud_segmentation_detector: str = ""
            self.segmentation3D: str = ""
            self.oriented_photos: str = ""
            self.photo_segmentation_detector: str = ""
            self.segmentation2D: str = ""

    class Outputs:
        def __init__(self) -> None:
            self.segmentation3D: str = ""
            self.segmented_point_cloud: str = ""
            self.segmentation2D: str = ""
            self.segmented_photos: str = ""
            self.lines3D: str = ""
            self.exported_lines3D_DGN: str = ""
            self.exported_lines3D_cesium: str = ""


class ChangeDetectionJobSettings:
    """
    Settings for Change Detection jobs
    """

    def __init__(self) -> None:
        self.type = JobType.ChangeDetection
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()
        self.color_threshold_low: float = 0.
        self.color_threshold_high: float = 0.
        self.dist_threshold_low: float = 0.
        self.dist_threshold_high: float = 0.
        self.resolution: float = 0.
        self.min_points: int = 0
        self.export_srs: str = ""

    def to_json(self) -> dict:
        json_dict = {}
        json_dict["inputs"] = []
        if self.inputs.point_clouds1:
            json_dict["inputs"].append({"name": "pointClouds1", "realityDataId": self.inputs.point_clouds1})
        if self.inputs.point_clouds2:
            json_dict["inputs"].append({"name": "pointClouds2", "realityDataId": self.inputs.point_clouds2})
        if self.inputs.meshes1:
            json_dict["inputs"].append({"name": "meshes1", "realityDataId": self.inputs.meshes1})
        if self.inputs.meshes2:
            json_dict["inputs"].append({"name": "meshes2", "realityDataId": self.inputs.meshes2})
        json_dict["outputs"] = []
        if self.outputs.objects3D:
            json_dict["outputs"].append({"name": "objects3D", "realityDataId": self.outputs.objects3D})
        if self.outputs.exported_locations3D_SHP:
            json_dict["outputs"].append({"name": "exportedLocations3DSHP", "realityDataId": self.outputs.exported_locations3D_SHP})
        if self.color_threshold_low:
            json_dict["colorThresholdLow"] = str(self.color_threshold_low)
        if self.color_threshold_high:
            json_dict["colorThresholdHigh"] = str(self.color_threshold_high)
        if self.dist_threshold_low:
            json_dict["distThresholdLow"] = str(self.dist_threshold_low)
        if self.dist_threshold_high:
            json_dict["distThresholdHigh"] = str(self.dist_threshold_high)
        if self.resolution:
            json_dict["resolution"] = str(self.resolution)
        if self.min_points:
            json_dict["minPoints"] = str(self.min_points)
        if self.export_srs:
            json_dict["exportSrs"] = self.export_srs
        return json_dict

    @classmethod
    def from_json(cls, settings_json: dict) -> ReturnValue[ChangeDetectionJobSettings]:
        new_job_settings = cls()
        try:
            inputs_json = settings_json["inputs"]
            for input_dict in inputs_json:
                if input_dict["name"] == "pointClouds1":
                    new_job_settings.inputs.point_clouds1 = input_dict["realityDataId"]
                elif input_dict["name"] == "pointClouds2":
                    new_job_settings.inputs.point_clouds2 = input_dict["realityDataId"]
                elif input_dict["name"] == "meshes1":
                    new_job_settings.inputs.meshes1 = input_dict["realityDataId"]
                elif input_dict["name"] == "meshes2":
                    new_job_settings.inputs.meshes2 = input_dict["realityDataId"]
                else:
                    raise TypeError("found non expected input name")
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["name"] == "objects3D":
                    new_job_settings.outputs.objects3D = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedLocations3DSHP":
                    new_job_settings.outputs.exported_locations3D_SHP = output_dict["realityDataId"]
                else:
                    raise TypeError("found non expected output name")
            if "colorThresholdLow" in settings_json:
                new_job_settings.color_threshold_low = float(settings_json["colorThresholdLow"])
            if "colorThresholdHigh" in settings_json:
                new_job_settings.color_threshold_high = float(settings_json["colorThresholdHigh"])
            if "distThresholdLow" in settings_json:
                new_job_settings.dist_threshold_low = float(settings_json["distThresholdLow"])
            if "distThresholdHigh" in settings_json:
                new_job_settings.dist_threshold_high = float(settings_json["distThresholdHigh"])
            if "resolution" in settings_json:
                new_job_settings.resolution = float(settings_json["resolution"])
            if "minPoints" in settings_json:
                new_job_settings.min_points = int(settings_json["minPoints"])
            if "exportSrs" in settings_json:
                new_job_settings.export_srs = settings_json["exportSrs"]
        except (KeyError, TypeError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        def __init__(self) -> None:
            self.point_clouds1: str = ""
            self.point_clouds2: str = ""
            self.meshes1: str = ""
            self.meshes2: str = ""

    class Outputs:
        def __init__(self) -> None:
            self.objects3D: str = ""
            self.exported_locations3D_SHP: str = ""


JobSettings = TypeVar("JobSettings",
                      O2DJobSettings,
                      S2DJobSettings,
                      O3DJobSettings,
                      S3DJobSettings,
                      L3DJobSettings,
                      ChangeDetectionJobSettings)

# def json_to_job_settings(job_json: dict) -> ReturnValue[JobSettings]:
#     if job_json["type"] == "objects2D":
#         return ReturnValue(value=O2DJobSettings.from_json(job_json["settings"]), error="")
#     if job_json["type"] == "segmentation2D":
#         return ReturnValue(value=S2DJobSettings.from_json(job_json["settings"]), error="")
#     else:
#         return ReturnValue(value=None, error="")
