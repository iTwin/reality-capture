# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

from __future__ import annotations
from typing import TypeVar

from reality_apis.RDAS.rdas_enums import RDAJobType
from reality_apis.utils import ReturnValue


class O2DJobSettings:
    """
    Settings for Object Detection 2D jobs.

    Attributes:
        type: Type of job settings.
        inputs: Possible inputs for this job. Should be the ids of the inputs in the cloud.
        outputs: Possible outputs for this job. Fill the outputs you want for the job with a string (normally the name
            of the output) before passing the settings to create_job.
    """

    def __init__(self) -> None:
        self.type = RDAJobType.O2D
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()

    def to_json(self) -> dict:
        """
        Transform settings into a dictionary compatible with json.

        Returns:
            Dictionary with settings values.
        """
        json_dict = dict()
        json_dict["inputs"] = list()
        if self.inputs.photos:
            json_dict["inputs"].append(
                {"name": "photos", "realityDataId": self.inputs.photos}
            )
        if self.inputs.photo_object_detector:
            json_dict["inputs"].append(
                {
                    "name": "photoObjectDetector",
                    "realityDataId": self.inputs.photo_object_detector,
                }
            )
        json_dict["outputs"] = list()
        if self.outputs.objects2D:
            json_dict["outputs"].append("objects2D")
        return json_dict

    @classmethod
    def from_json(cls, settings_json: dict) -> ReturnValue[O2DJobSettings]:
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
                if input_dict["name"] == "photos":
                    new_job_settings.inputs.photos = input_dict["realityDataId"]
                elif input_dict["name"] == "photoObjectDetector":
                    new_job_settings.inputs.photo_object_detector = input_dict[
                        "realityDataId"
                    ]
                else:
                    raise TypeError(
                        "found non expected input name:" + input_dict["name"]
                    )
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["name"] == "objects2D":
                    new_job_settings.outputs.objects2D = output_dict["realityDataId"]
                else:
                    raise TypeError(
                        "found non expected output name" + output_dict["name"]
                    )
        except (KeyError, TypeError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        """
        Possible inputs for an Object Detection 2D job.

        Attributes:
            photos: Path to ContextScene with photos to analyze.
            photo_object_detector: Path to photo object detector to apply.
        """

        def __init__(self) -> None:
            self.photos: str = ""
            self.photo_object_detector: str = ""

    class Outputs:
        """
        Possible outputs for an Object Detection 2D job.

        Attributes:
            objects2D: Objects detected in photos.
        """

        def __init__(self) -> None:
            self.objects2D: str = ""


class S2DJobSettings:
    """
    Settings for Segmentation 2D jobs.

    Attributes:
        type: Type of job settings.
        inputs: Possible inputs for this job. Should be the ids of the inputs in the cloud.
        outputs: Possible outputs for this job. Fill the outputs you want for the job with a string (normally the name
            of the output) before passing the settings to create_job.
    """

    def __init__(self) -> None:
        self.type = RDAJobType.S2D
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()

    def to_json(self) -> dict:
        """
        Transform settings into a dictionary compatible with json.

        Returns:
            Dictionary with settings values.
        """
        json_dict = dict()
        json_dict["inputs"] = list()
        if self.inputs.photos:
            json_dict["inputs"].append(
                {"name": "photos", "realityDataId": self.inputs.photos}
            )
        if self.inputs.photo_segmentation_detector:
            json_dict["inputs"].append(
                {
                    "name": "photoSegmentationDetector",
                    "realityDataId": self.inputs.photo_segmentation_detector,
                }
            )
        if self.inputs.orthophoto:
            json_dict["inputs"].append(
                {"name": "orthophoto", "realityDataId": self.inputs.orthophoto}
            )
        if self.inputs.orthophoto_segmentation_detector:
            json_dict["inputs"].append(
                {
                    "name": "orthophotoSegmentationDetector",
                    "realityDataId": self.inputs.orthophoto_segmentation_detector,
                }
            )
        json_dict["outputs"] = list()
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
        if self.outputs.exported_lines2D_DGN:
            json_dict["outputs"].append("exportedLines2DDGN")
        if self.outputs.exported_lines2D_SHP:
            json_dict["outputs"].append("exportedLines2DSHP")
        return json_dict

    @classmethod
    def from_json(cls, settings_json: dict) -> ReturnValue[S2DJobSettings]:
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
                if input_dict["name"] == "photos":
                    new_job_settings.inputs.photos = input_dict["realityDataId"]
                elif input_dict["name"] == "photoSegmentationDetector":
                    new_job_settings.inputs.photo_segmentation_detector = input_dict[
                        "realityDataId"
                    ]
                elif input_dict["name"] == "orthophoto":
                    new_job_settings.inputs.orthophoto = input_dict["realityDataId"]
                elif input_dict["name"] == "orthophotoSegmentationDetector":
                    new_job_settings.inputs.orthophoto_segmentation_detector = (
                        input_dict["realityDataId"]
                    )
                else:
                    raise TypeError(
                        "found non expected input name:" + input_dict["name"]
                    )
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["name"] == "segmentation2D":
                    new_job_settings.outputs.segmentation2D = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "segmentedPhotos":
                    new_job_settings.outputs.segmented_photos = output_dict["realityDataId"]
                elif output_dict["name"] == "polygons2D":
                    new_job_settings.outputs.polygons2D = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedPolygons2DSHP":
                    new_job_settings.outputs.exported_polygons2D_SHP = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "lines2D":
                    new_job_settings.outputs.lines2D = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedLines2DDGN":
                    new_job_settings.outputs.exported_lines2D_DGN = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedLines2DSHP":
                    new_job_settings.outputs.exported_lines2D_SHP = output_dict["realityDataId"]
                else:
                    raise TypeError(
                        "found non expected output name:" + output_dict["name"]
                    )
        except (TypeError, KeyError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        """
        Possible inputs for a Segmentation 2D job.

        Attributes:
            photos: Path to ContextScene with photos to analyze.
            photo_segmentation_detector: Path to photo segmentation detector to apply.
            orthophoto: Path to orthophoto to analyse.
            orthophoto_segmentation_detector: Path to orthophoto segmentation detector to apply.
        """

        def __init__(self) -> None:
            self.photos: str = ""
            self.photo_segmentation_detector: str = ""
            self.orthophoto: str = ""
            self.orthophoto_segmentation_detector: str = ""

    class Outputs:
        """
        Possible outputs for a Segmentation 2D job.

        Attributes:
            segmentation2D: Segmented photos.
            polygons2D: Detected 2D polygons.
            exported_polygons2D_SHP: 2D polygons exported to ESRI shapefile.
            lines2D: Detected 2D lines.
            segmented_photos: ContextScene pointing to segmented photos.
            exported_lines2D_SHP: 2D lines exported to ESRI shapefile.
            exported_lines2D_DGN: 2D lines exported to DGN file.
        """

        def __init__(self) -> None:
            self.segmentation2D: str = ""
            self.polygons2D: str = ""
            self.exported_polygons2D_SHP: str = ""
            self.lines2D: str = ""
            self.segmented_photos: str = ""
            self.exported_lines2D_SHP: str = ""
            self.exported_lines2D_DGN: str = ""


class O3DJobSettings:
    """
    Settings for Object Detection 3D jobs.

    Attributes:
        type: Type of job settings.
        inputs: Possible inputs for this job. Should be the ids of the inputs in the cloud.
        outputs: Possible outputs for this job. Fill the outputs you want for the job with a string (normally the name
            of the output) before passing the settings to create_job.
        use_tie_points: Improve detection using tie points in orientedPhotos.
        min_photos: Minimum number of 2D objects to generate a 3D object.
        max_dist: Maximum distance between photos and 3D objects.
        export_srs: SRS used by exports.
    """

    def __init__(self) -> None:
        self.type = RDAJobType.O3D
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()
        self.use_tie_points: bool = False
        self.min_photos: int = 0
        self.max_dist: float = 0.0
        self.export_srs: str = ""

    def to_json(self) -> dict:
        """
        Transform settings into a dictionary compatible with json.

        Returns:
            Dictionary with settings values.
        """
        json_dict = dict()
        json_dict["inputs"] = list()
        if self.inputs.oriented_photos:
            json_dict["inputs"].append(
                {"name": "orientedPhotos", "realityDataId": self.inputs.oriented_photos}
            )
        if self.inputs.photo_object_detector:
            json_dict["inputs"].append(
                {
                    "name": "photoObjectDetector",
                    "realityDataId": self.inputs.photo_object_detector,
                }
            )
        if self.inputs.objects2D:
            json_dict["inputs"].append(
                {"name": "objects2D", "realityDataId": self.inputs.objects2D}
            )
        if self.inputs.point_clouds:
            json_dict["inputs"].append(
                {"name": "pointClouds", "realityDataId": self.inputs.point_clouds}
            )
        if self.inputs.meshes:
            json_dict["meshes"].append(
                {"name": "meshes", "realityDataId": self.inputs.meshes}
            )
        json_dict["outputs"] = list()
        if self.outputs.objects2D:
            json_dict["outputs"].append("objects2D")
        if self.outputs.objects3D:
            json_dict["outputs"].append("objects3D")
        if self.outputs.exported_objects3D_DGN:
            json_dict["outputs"].append("exportedObjects3DDGN")
        if self.outputs.exported_objects3D_cesium:
            json_dict["outputs"].append("exportedObjects3DCesium")
        if self.outputs.exported_locations3D_SHP:
            json_dict["outputs"].append("exportedLocations3DSHP")
        if self.use_tie_points:
            json_dict["useTiePoints"] = "true"
        if self.min_photos:
            json_dict["MinPhotos"] = str(self.min_photos)
        if self.max_dist:
            json_dict["MaxDist"] = str(self.max_dist)
        if self.export_srs:
            json_dict["exportSrs"] = self.export_srs
        return json_dict

    @classmethod
    def from_json(cls, settings_json: dict) -> ReturnValue[O3DJobSettings]:
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
                if input_dict["name"] == "orientedPhotos":
                    new_job_settings.inputs.oriented_photos = input_dict[
                        "realityDataId"
                    ]
                elif input_dict["name"] == "photoObjectDetector":
                    new_job_settings.inputs.photo_object_detector = input_dict[
                        "realityDataId"
                    ]
                elif input_dict["name"] == "pointClouds":
                    new_job_settings.inputs.point_clouds = input_dict["realityDataId"]
                elif input_dict["name"] == "objects2D":
                    new_job_settings.inputs.objects2D = input_dict["realityDataId"]
                elif input_dict["name"] == "meshes":
                    new_job_settings.inputs.meshes = input_dict["realityDataId"]
                else:
                    raise TypeError(
                        "found non expected input name:" + input_dict["name"]
                    )
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["name"] == "objects2D":
                    new_job_settings.outputs.objects2D = output_dict["realityDataId"]
                elif output_dict["name"] == "objects3D":
                    new_job_settings.outputs.objects3D = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedObjects3DDGN":
                    new_job_settings.outputs.exported_objects3D_DGN = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "exportedObjects3DCesium":
                    new_job_settings.outputs.exported_objects3D_cesium = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "exportedLocations3DSHP":
                    new_job_settings.outputs.exported_locations3D_SHP = output_dict[
                        "realityDataId"
                    ]
                else:
                    raise TypeError(
                        "found non expected output name" + output_dict["name"]
                    )
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
        """
        Possible inputs for an Object Detection 3D job.

        Attributes:
            oriented_photos: Path to ContextScene with oriented photos to analyze.
            point_clouds: Collection of point clouds.
            photo_object_detector: Path to photo object detector to apply.
            objects2D: Given 2D objects.
            meshes: Collection of meshes.
        """

        def __init__(self) -> None:
            self.oriented_photos: str = ""
            self.point_clouds: str = ""
            self.photo_object_detector: str = ""
            self.objects2D: str = ""
            self.meshes: str = ""

    class Outputs:
        """
        Possible outputs for an Object Detection 3D job.

        Attributes:
            objects2D: 2D objects detected by current job.
            objects3D: Detected 3D objects.
            exported_objects3D_DGN: DGN file export with 3D objects.
            exported_objects3D_cesium: Cesium 3D Tiles file export with 3D objects.
            exported_locations3D_SHP: ESRI SHP file export with locations of the 3D objects.
        """

        def __init__(self) -> None:
            self.objects2D: str = ""
            self.objects3D: str = ""
            self.exported_objects3D_DGN: str = ""
            self.exported_objects3D_cesium: str = ""
            self.exported_locations3D_SHP: str = ""


class S3DJobSettings:
    """
    Settings for Segmentation 3D jobs.

    Attributes:
        type: Type of job settings.
        inputs: Possible inputs for this job. Should be the ids of the inputs in the cloud.
        outputs: Possible outputs for this job. Fill the outputs you want for the job with a string (normally the name
            of the output) before passing the settings to create_job.
        save_confidence: If confidence is saved on output files or not.
        export_srs: SRS used by exports.
    """

    def __init__(self) -> None:
        self.type = RDAJobType.S3D
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()
        self.save_confidence: bool = False
        self.export_srs: str = ""

    def to_json(self) -> dict:
        """
        Transform settings into a dictionary compatible with json.

        Returns:
            Dictionary with settings values.
        """
        json_dict = dict()
        json_dict["inputs"] = list()
        if self.inputs.point_clouds:
            json_dict["inputs"].append(
                {"name": "pointClouds", "realityDataId": self.inputs.point_clouds}
            )
        if self.inputs.meshes:
            json_dict["inputs"].append(
                {"name": "meshes", "realityDataId": self.inputs.meshes}
            )
        if self.inputs.point_cloud_segmentation_detector:
            json_dict["inputs"].append(
                {
                    "name": "pointCloudSegmentationDetector",
                    "realityDataId": self.inputs.point_cloud_segmentation_detector,
                }
            )
        if self.inputs.segmentation3D:
            json_dict["inputs"].append(
                {"name": "segmentation3D", "realityDataId": self.inputs.segmentation3D}
            )
        if self.inputs.oriented_photos:
            json_dict["inputs"].append(
                {"name": "orientedPhotos", "realityDataId": self.inputs.oriented_photos}
            )
        if self.inputs.photo_object_detector:
            json_dict["inputs"].append(
                {
                    "name": "photoObjectDetector",
                    "realityDataId": self.inputs.photo_object_detector,
                }
            )
        if self.inputs.objects2D:
            json_dict["inputs"].append(
                {"name": "objects2D", "realityDataId": self.inputs.objects2D}
            )
        if self.inputs.clip_polygon:
            json_dict["inputs"].append(
                {"name": "clipPolygon", "realityDataId": self.inputs.clip_polygon}
            )

        json_dict["outputs"] = list()
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
                if input_dict["name"] == "pointClouds":
                    new_job_settings.inputs.point_clouds = input_dict["realityDataId"]
                elif input_dict["name"] == "meshes":
                    new_job_settings.inputs.meshes = input_dict["realityDataId"]
                elif input_dict["name"] == "pointCloudSegmentationDetector":
                    new_job_settings.inputs.point_cloud_segmentation_detector = (
                        input_dict["realityDataId"]
                    )
                elif input_dict["name"] == "segmentation3D":
                    new_job_settings.inputs.segmentation3D = input_dict["realityDataId"]
                elif input_dict["name"] == "orientedPhotos":
                    new_job_settings.inputs.oriented_photos = input_dict[
                        "realityDataId"
                    ]
                elif input_dict["name"] == "photoObjectDetector":
                    new_job_settings.inputs.photo_object_detector = input_dict[
                        "realityDataId"
                    ]
                elif input_dict["name"] == "objects2D":
                    new_job_settings.inputs.objects2D = input_dict["realityDataId"]
                elif input_dict["name"] == "clipPolygon":
                    new_job_settings.inputs.clip_polygon = input_dict["realityDataId"]
                else:
                    raise TypeError(
                        "found non expected input name:" + input_dict["name"]
                    )
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["name"] == "segmentation3D":
                    new_job_settings.outputs.segmentation3D = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "segmentedPointCloud":
                    new_job_settings.outputs.segmented_point_cloud = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "objects2D":
                    new_job_settings.outputs.objects2D = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedSegmentation3DPOD":
                    new_job_settings.outputs.exported_segmentation3D_POD = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "exportedSegmentation3DLAS":
                    new_job_settings.outputs.exported_segmentation3D_LAS = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "exportedSegmentation3DLAZ":
                    new_job_settings.outputs.exported_segmentation3D_LAZ = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "exportedSegmentation3DPLY":
                    new_job_settings.outputs.exported_segmentation3D_PLY = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "objects3D":
                    new_job_settings.outputs.objects3D = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedObjects3DDGN":
                    new_job_settings.outputs.exported_objects3D_DGN = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "exportedObjects3DCesium":
                    new_job_settings.outputs.exported_objects3D_cesium = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "exportedLocations3DSHP":
                    new_job_settings.outputs.exported_locations3D_SHP = output_dict[
                        "realityDataId"
                    ]
                else:
                    raise TypeError(
                        "found non expected output name:" + output_dict["name"]
                    )
            if "saveConfidence" in settings_json:
                new_job_settings.save_confidence = bool(settings_json["saveConfidence"])
            if "exportSrs" in settings_json:
                new_job_settings.export_srs = settings_json["exportSrs"]
        except (KeyError, TypeError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        """
        Possible inputs for a Segmentation 3D job.

        Attributes:
            point_clouds: Collection of point clouds.
            meshes: Collection of meshes.
            point_cloud_segmentation_detector: Point cloud segmentation detector.
            segmentation3D: Given 3D segmentation.
            oriented_photos: Photos and their orientation.
            photo_object_detector: Object detector to analyze oriented photos.
            objects2D: Given 2D objects.
            clip_polygon: Path of clipping polygon to apply.
        """

        def __init__(self) -> None:
            self.point_clouds: str = ""
            self.meshes: str = ""
            self.point_cloud_segmentation_detector: str = ""
            self.segmentation3D: str = ""
            self.oriented_photos: str = ""
            self.photo_object_detector: str = ""
            self.objects2D: str = ""
            self.clip_polygon: str = ""

    class Outputs:
        """
        Possible outputs for a Segmentation 3D job.

        Attributes:
            segmentation3D: 3D segmentation computed by current job.
            segmented_point_cloud: 3D segmentation as an OPC file.
            objects2D: 2D objects detected by current job.
            exported_segmentation3D_POD: 3D segmentation exported as a POD file.
            exported_segmentation3D_LAS: 3D segmentation exported as a LAS file.
            exported_segmentation3D_LAZ: 3D segmentation exported as a LAZ file.
            exported_segmentation3D_PLY: 3D segmentation exported as a PLY file.
            objects3D: 3D objects inferred from 3D segmentation.
            exported_objects3D_DGN: DGN file export with 3D objects.
            exported_objects3D_cesium: Cesium 3D Tiles file export with 3D objects
            exported_locations3D_SHP: ESRI SHP file export with locations of the 3D objects
        """

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
    Settings for Line Detection 3D jobs.

    Attributes:
        type: Type of job settings.
        inputs: Possible inputs for this job. Should be the ids of the inputs in the cloud.
        outputs: Possible outputs for this job. Fill the outputs you want for the job with a string (normally the name
            of the output) before passing the settings to create_job.
        compute_line_width: Estimation 3D line width at each vertex.
        remove_small_components: Remove 3D lines with total length smaller than this value.
        export_srs: SRS used by exports.
    """

    def __init__(self) -> None:
        self.type = RDAJobType.L3D
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()
        self.compute_line_width: bool = False
        self.remove_small_components: float = 0.0
        self.export_srs: str = ""

    def to_json(self) -> dict:
        """
        Transform settings into a dictionary compatible with json.

        Returns:
            Dictionary with settings values.
        """
        json_dict = dict()
        json_dict["inputs"] = list()
        if self.inputs.point_clouds:
            json_dict["inputs"].append(
                {"name": "pointClouds", "realityDataId": self.inputs.point_clouds}
            )
        if self.inputs.meshes:
            json_dict["inputs"].append(
                {"name": "meshes", "realityDataId": self.inputs.meshes}
            )
        if self.inputs.point_cloud_segmentation_detector:
            json_dict["inputs"].append(
                {
                    "name": "pointCloudSegmentationDetector",
                    "realityDataId": self.inputs.point_cloud_segmentation_detector,
                }
            )
        if self.inputs.segmentation3D:
            json_dict["inputs"].append(
                {"name": "segmentation3D", "realityDataId": self.inputs.segmentation3D}
            )
        if self.inputs.oriented_photos:
            json_dict["inputs"].append(
                {"name": "orientedPhotos", "realityDataId": self.inputs.oriented_photos}
            )
        if self.inputs.photo_segmentation_detector:
            json_dict["inputs"].append(
                {
                    "name": "photoSegmentationDetector",
                    "realityDataId": self.inputs.photo_segmentation_detector,
                }
            )
        if self.inputs.segmentation2D:
            json_dict["inputs"].append(
                {"name": "segmentation2D", "realityDataId": self.inputs.segmentation2D}
            )
        json_dict["outputs"] = list()
        if self.outputs.segmentation3D:
            json_dict["outputs"].append("segmentation3D")
        if self.outputs.segmented_point_cloud:
            json_dict["outputs"].append("segmentedPointCloud")
        if self.outputs.segmentation2D:
            json_dict["outputs"].append("segmentation2D")
        if self.outputs.segmented_photos:
            json_dict["outputs"].append("segmentedPhotos")
        if self.outputs.lines3D:
            json_dict["outputs"].append("lines3D")
        if self.outputs.exported_lines3D_DGN:
            json_dict["outputs"].append("exportedLines3DDGN")
        if self.outputs.exported_lines3D_cesium:
            json_dict["outputs"].append("exportedLines3DCesium")
        if self.outputs.patches3D:
            json_dict["outputs"].append("patches3D")
        if self.outputs.exported_patches3D_DGN:
            json_dict["outputs"].append("exportedPatches3DDGN")
        if self.outputs.exported_patches3D_cesium:
            json_dict["outputs"].append("exportedPatches3DCesium")
        if self.compute_line_width:
            json_dict["computeLineWidth"] = "true"
        if self.remove_small_components:
            json_dict["removeSmallComponents"] = str(self.remove_small_components)
        if self.export_srs:
            json_dict["exportSrs"] = self.export_srs
        return json_dict

    @classmethod
    def from_json(cls, settings_json: dict) -> ReturnValue[L3DJobSettings]:
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
                if input_dict["name"] == "pointClouds":
                    new_job_settings.inputs.point_clouds = input_dict["realityDataId"]
                elif input_dict["name"] == "meshes":
                    new_job_settings.inputs.meshes = input_dict["realityDataId"]
                elif input_dict["name"] == "pointCloudSegmentationDetector":
                    new_job_settings.inputs.point_cloud_segmentation_detector = (
                        input_dict["realityDataId"]
                    )
                elif input_dict["name"] == "segmentation3D":
                    new_job_settings.inputs.segmentation3D = input_dict["realityDataId"]
                elif input_dict["name"] == "orientedPhotos":
                    new_job_settings.inputs.oriented_photos = input_dict[
                        "realityDataId"
                    ]
                elif input_dict["name"] == "photoSegmentationDetector":
                    new_job_settings.inputs.photo_segmentation_detector = input_dict[
                        "realityDataId"
                    ]
                elif input_dict["name"] == "segmentation2D":
                    new_job_settings.inputs.segmentation2D = input_dict["realityDataId"]
                else:
                    raise TypeError(
                        "found non expected input name:" + input_dict["name"]
                    )
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["name"] == "segmentation3D":
                    new_job_settings.outputs.segmentation3D = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "segmentedPointCloud":
                    new_job_settings.outputs.segmented_point_cloud = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "segmentation2D":
                    new_job_settings.outputs.segmentation2D = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "segmentedPhotos":
                    new_job_settings.outputs.segmented_photos = output_dict["realityDataId"]
                elif output_dict["name"] == "lines3D":
                    new_job_settings.outputs.lines3D = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedLines3DDGN":
                    new_job_settings.outputs.exported_lines3D_DGN = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "exportedLines3DCesium":
                    new_job_settings.outputs.exported_lines3D_cesium = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "patches3D":
                    new_job_settings.outputs.patches3D = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedPatches3DDGN":
                    new_job_settings.outputs.exported_patches3D_DGN = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "exportedPatches3DCesium":
                    new_job_settings.outputs.exported_patches3D_cesium = output_dict[
                        "realityDataId"
                    ]
                else:
                    raise TypeError(
                        "found non expected output name:" + output_dict["name"]
                    )
            if "computeLineWidth" in settings_json:
                new_job_settings.compute_line_width = bool(
                    settings_json["computeLineWidth"]
                )
            if "removeSmallComponents" in settings_json:
                new_job_settings.remove_small_components = float(
                    settings_json["removeSmallComponents"]
                )
            if "exportSrs" in settings_json:
                new_job_settings.export_srs = settings_json["exportSrs"]
        except (KeyError, TypeError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        """
        Possible inputs for a Line Detection 3D job.

        Attributes:
            point_clouds: Collection of point clouds.
            meshes: Collection of meshes.
            point_cloud_segmentation_detector: Point cloud segmentation detector.
            segmentation3D: Given 3D segmentation.
            oriented_photos: Photos and their orientation.
            photo_segmentation_detector: Segmentation detector to apply to oriented photos.
            segmentation2D: Given 2D segmentation.
        """

        def __init__(self) -> None:
            self.point_clouds: str = ""
            self.meshes: str = ""
            self.point_cloud_segmentation_detector: str = ""
            self.segmentation3D: str = ""
            self.oriented_photos: str = ""
            self.photo_segmentation_detector: str = ""
            self.segmentation2D: str = ""

    class Outputs:
        """
        Possible outputs for a Line Detection 3D job.

        Attributes:
            segmentation3D: 3D segmentation performed by current job.
            segmented_point_cloud: 3D segmentation as an OPC file.
            segmentation2D: 2D segmentation performed by current job.
            lines3D: Detected 3D lines.
            exported_lines3D_DGN: DGN file export with 3D lines.
            exported_lines3D_cesium: Cesium 3D Tiles file export with 3D lines.
            patches3D: Detected patches.
            exported_patches3D_DGN: DGN file export with patches.
            exported_patches3D_cesium: Cesium 3D Tiles file export with 3D patches.
        """

        def __init__(self) -> None:
            self.segmentation3D: str = ""
            self.segmented_point_cloud: str = ""
            self.segmentation2D: str = ""
            self.segmented_photos: str = ""
            self.lines3D: str = ""
            self.exported_lines3D_DGN: str = ""
            self.exported_lines3D_cesium: str = ""
            self.patches3D: str = ""
            self.exported_patches3D_DGN: str = ""
            self.exported_patches3D_cesium: str = ""


class ChangeDetectionJobSettings:
    """
    Settings for Change Detection jobs.

    Attributes:
        type: Type of job settings.
        inputs: Possible inputs for this job. Should be the ids of the inputs in the cloud.
        outputs: Possible outputs for this job. Fill the outputs you want for the job with a string (normally the name
            of the output) before passing the settings to create_job.
        color_threshold_low: Low threshold to detect color changes (hysteresis detection).
        color_threshold_high: High threshold to detect color changes (hysteresis detection).
        dist_threshold_low: Low threshold to detect spatial changes (hysteresis detection).
        dist_threshold_high: High threshold to detect spatial changes (hysteresis detection).
        resolution: Target point cloud resolution when starting from meshes.
        min_points: Minimum number of points in a region to be considered as a change.
        export_srs: SRS used by exports.
    """

    def __init__(self) -> None:
        self.type = RDAJobType.ChangeDetection
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()
        self.color_threshold_low: float = 0.0
        self.color_threshold_high: float = 0.0
        self.dist_threshold_low: float = 0.0
        self.dist_threshold_high: float = 0.0
        self.resolution: float = 0.0
        self.min_points: int = 0
        self.export_srs: str = ""

    def to_json(self) -> dict:
        """
        Transform settings into a dictionary compatible with json.

        Returns:
            Dictionary with settings values.
        """
        json_dict = dict()
        json_dict["inputs"] = list()
        if self.inputs.point_clouds1:
            json_dict["inputs"].append(
                {"name": "pointClouds1", "realityDataId": self.inputs.point_clouds1}
            )
        if self.inputs.point_clouds2:
            json_dict["inputs"].append(
                {"name": "pointClouds2", "realityDataId": self.inputs.point_clouds2}
            )
        if self.inputs.meshes1:
            json_dict["inputs"].append(
                {"name": "meshes1", "realityDataId": self.inputs.meshes1}
            )
        if self.inputs.meshes2:
            json_dict["inputs"].append(
                {"name": "meshes2", "realityDataId": self.inputs.meshes2}
            )
        json_dict["outputs"] = list()
        if self.outputs.objects3D:
            json_dict["outputs"].append("objects3D")
        if self.outputs.exported_locations3D_SHP:
            json_dict["outputs"].append("exportedLocations3DSHP")
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
                if input_dict["name"] == "pointClouds1":
                    new_job_settings.inputs.point_clouds1 = input_dict["realityDataId"]
                elif input_dict["name"] == "pointClouds2":
                    new_job_settings.inputs.point_clouds2 = input_dict["realityDataId"]
                elif input_dict["name"] == "meshes1":
                    new_job_settings.inputs.meshes1 = input_dict["realityDataId"]
                elif input_dict["name"] == "meshes2":
                    new_job_settings.inputs.meshes2 = input_dict["realityDataId"]
                else:
                    raise TypeError(
                        "found non expected input name:" + input_dict["name"]
                    )
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["name"] == "objects3D":
                    new_job_settings.outputs.objects3D = output_dict["realityDataId"]
                elif output_dict["name"] == "exportedLocations3DSHP":
                    new_job_settings.outputs.exported_locations3D_SHP = output_dict[
                        "realityDataId"
                    ]
                else:
                    raise TypeError(
                        "found non expected output name:" + output_dict["name"]
                    )
            if "colorThresholdLow" in settings_json:
                new_job_settings.color_threshold_low = float(
                    settings_json["colorThresholdLow"]
                )
            if "colorThresholdHigh" in settings_json:
                new_job_settings.color_threshold_high = float(
                    settings_json["colorThresholdHigh"]
                )
            if "distThresholdLow" in settings_json:
                new_job_settings.dist_threshold_low = float(
                    settings_json["distThresholdLow"]
                )
            if "distThresholdHigh" in settings_json:
                new_job_settings.dist_threshold_high = float(
                    settings_json["distThresholdHigh"]
                )
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
        """
        Possible inputs for a  Change Detection job.

        Attributes:
            point_clouds1: First collection of point clouds.
            point_clouds2: Second collection of point clouds.
            meshes1: First collection of meshes.
            meshes2: Second collection of meshes.
        """

        def __init__(self) -> None:
            self.point_clouds1: str = ""
            self.point_clouds2: str = ""
            self.meshes1: str = ""
            self.meshes2: str = ""

    class Outputs:
        """
        Possible outputs for a Change Detection job.

        Attributes:
            objects3D: Regions with changes.
            exported_locations3D_SHP: ESRI SHP file export with locations of regions with changes.
        """

        def __init__(self) -> None:
            self.objects3D: str = ""
            self.exported_locations3D_SHP: str = ""


class ExtractGroundJobSettings:
    """
    Settings for Extract Ground jobs. Will be available in an upcoming update.

    Attributes:
        type: Type of job settings.
        inputs: Possible inputs for this job. Should be the ids of the inputs in the cloud.
        outputs: Possible outputs for this job. Fill the outputs you want for the job with a string (normally the name
            of the output) before passing the settings to create_job.
        export_srs: SRS used by exports.
    """

    def __init__(self) -> None:
        self.type = RDAJobType.ExtractGround
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()
        self.export_srs: str = ""

    def to_json(self) -> dict:
        """
        Transform settings into a dictionary compatible with json.

        Returns:
            Dictionary with settings values.
        """
        json_dict = dict()
        json_dict["inputs"] = list()
        if self.inputs.point_clouds:
            json_dict["inputs"].append(
                {"name": "pointClouds", "realityDataId": self.inputs.point_clouds}
            )
        if self.inputs.meshes:
            json_dict["inputs"].append(
                {"name": "meshes", "realityDataId": self.inputs.meshes}
            )
        if self.inputs.point_cloud_segmentation_detector:
            json_dict["inputs"].append(
                {
                    "name": "pointCloudSegmentationDetector",
                    "realityDataId": self.inputs.point_cloud_segmentation_detector,
                }
            )
        if self.inputs.clip_polygon:
            json_dict["inputs"].append(
                {"name": "clipPolygon", "realityDataId": self.inputs.clip_polygon}
            )

        json_dict["outputs"] = list()
        if self.outputs.segmentation3D:
            json_dict["outputs"].append("segmentation3D")
        if self.outputs.segmented_point_cloud:
            json_dict["outputs"].append("segmentedPointCloud")
        if self.outputs.exported_segmentation3D_POD:
            json_dict["outputs"].append("exportedSegmentation3DPOD")
        if self.outputs.exported_segmentation3D_LAS:
            json_dict["outputs"].append("exportedSegmentation3DLAS")
        if self.outputs.exported_segmentation3D_LAZ:
            json_dict["outputs"].append("exportedSegmentation3DLAZ")
        if self.export_srs:
            json_dict["exportSrs"] = self.export_srs
        return json_dict

    @classmethod
    def from_json(cls, settings_json: dict) -> ReturnValue[ExtractGroundJobSettings]:
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
                if input_dict["name"] == "pointClouds":
                    new_job_settings.inputs.point_clouds = input_dict["realityDataId"]
                elif input_dict["name"] == "meshes":
                    new_job_settings.inputs.meshes = input_dict["realityDataId"]
                elif input_dict["name"] == "pointCloudSegmentationDetector":
                    new_job_settings.inputs.point_cloud_segmentation_detector = (
                        input_dict["realityDataId"]
                    )
                elif input_dict["name"] == "clipPolygon":
                    new_job_settings.inputs.clip_polygon = input_dict["realityDataId"]
                else:
                    raise TypeError(
                        "found non expected input name:" + input_dict["name"]
                    )
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["name"] == "segmentation3D":
                    new_job_settings.outputs.segmentation3D = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "segmentedPointCloud":
                    new_job_settings.outputs.segmented_point_cloud = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "exportedSegmentation3DPOD":
                    new_job_settings.outputs.exported_segmentation3D_POD = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "exportedSegmentation3DLAS":
                    new_job_settings.outputs.exported_segmentation3D_LAS = output_dict[
                        "realityDataId"
                    ]
                elif output_dict["name"] == "exportedSegmentation3DLAZ":
                    new_job_settings.outputs.exported_segmentation3D_LAZ = output_dict[
                        "realityDataId"
                    ]
                else:
                    raise TypeError(
                        "found non expected output name:" + output_dict["name"]
                    )
            if "exportSrs" in settings_json:
                new_job_settings.export_srs = settings_json["exportSrs"]
        except (KeyError, TypeError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        """
        Possible inputs for an Extract Ground job.

        Attributes:
            point_clouds: Collection of point clouds.
            meshes: Collection of meshes.
            point_cloud_segmentation_detector: Point cloud segmentation detector.
            clip_polygon: Path of clipping polygon to apply.
        """

        def __init__(self) -> None:
            self.point_clouds: str = ""
            self.meshes: str = ""
            self.point_cloud_segmentation_detector: str = ""
            self.clip_polygon: str = ""

    class Outputs:
        """
        Possible outputs for an Extract Ground job.

        Attributes:
            segmentation3D: Ground segmentation computed by current job.
            segmented_point_cloud: 3D ground segmentation as an OPC file.
            exported_segmentation3D_POD: 3D ground segmentation exported as a POD file.
            exported_segmentation3D_LAS: 3D ground segmentation exported as a LAS file.
            exported_segmentation3D_LAZ: 3D ground segmentation exported as a LAZ file.
        """

        def __init__(self) -> None:
            self.segmentation3D: str = ""
            self.segmented_point_cloud: str = ""
            self.exported_segmentation3D_POD: str = ""
            self.exported_segmentation3D_LAS: str = ""
            self.exported_segmentation3D_LAZ: str = ""


JobSettings = TypeVar(
    "JobSettings",
    O2DJobSettings,
    S2DJobSettings,
    O3DJobSettings,
    S3DJobSettings,
    L3DJobSettings,
    ChangeDetectionJobSettings,
    ExtractGroundJobSettings
)
