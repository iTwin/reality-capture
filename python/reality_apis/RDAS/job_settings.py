# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

from __future__ import annotations
from typing import TypeVar

from reality_apis.RDAS.rdas_enums import RDAJobType
from reality_apis.utils import ReturnValue


class O2DJobSettings:
    """
    Settings for Object 2D jobs.

    Attributes:
        type: Type of job settings.
        inputs: Possible inputs for this job. Should be the ids of the inputs in the cloud.
        outputs: Possible outputs for this job. Fill the outputs you want for the job with a string (normally the name
            of the output) before passing the settings to create_job.
        options: Possible options for this job.
    """

    def __init__(self) -> None:
        self.type = RDAJobType.O2D
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()
        self.options = self.Options()

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
                {"type": "photos", "id": self.inputs.photos}
            )
        if self.inputs.photo_object_detector:
            json_dict["inputs"].append(
                {
                    "type": "photoObjectDetector",
                    "id": self.inputs.photo_object_detector,
                }
            )
        if self.inputs.objects2D:
            json_dict["inputs"].append(
                {"type": "objects2D", "id": self.inputs.objects2D}
            )
        if self.inputs.point_clouds:
            json_dict["inputs"].append(
                {"type": "pointClouds", "id": self.inputs.point_clouds}
            )
        if self.inputs.meshes:
            json_dict["inputs"].append(
                {"type": "meshes", "id": self.inputs.meshes}
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
        json_dict["options"] = dict()
        if self.options.use_tie_points:
            json_dict["options"]["useTiePoints"] = "true"
        if self.options.min_photos:
            json_dict["options"]["minPhotos"] = str(self.options.min_photos)
        if self.options.max_dist:
            json_dict["options"]["maxDist"] = str(self.options.max_dist)
        if self.options.export_srs:
            json_dict["options"]["exportSrs"] = self.options.export_srs
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
                if input_dict["type"] == "photos":
                    new_job_settings.inputs.photos = input_dict[
                        "id"
                    ]
                elif input_dict["type"] == "photoObjectDetector":
                    new_job_settings.inputs.photo_object_detector = input_dict[
                        "id"
                    ]
                elif input_dict["type"] == "pointClouds":
                    new_job_settings.inputs.point_clouds = input_dict["id"]
                elif input_dict["type"] == "objects2D":
                    new_job_settings.inputs.objects2D = input_dict["id"]
                elif input_dict["type"] == "meshes":
                    new_job_settings.inputs.meshes = input_dict["id"]
                else:
                    raise TypeError(
                        "found non expected input name:" + input_dict["type"]
                    )
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["type"] == "objects2D":
                    new_job_settings.outputs.objects2D = output_dict["id"]
                elif output_dict["type"] == "objects3D":
                    new_job_settings.outputs.objects3D = output_dict["id"]
                elif output_dict["type"] == "exportedObjects3DDGN":
                    new_job_settings.outputs.exported_objects3D_DGN = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "exportedObjects3DCesium":
                    new_job_settings.outputs.exported_objects3D_cesium = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "exportedLocations3DSHP":
                    new_job_settings.outputs.exported_locations3D_SHP = output_dict[
                        "id"
                    ]
                else:
                    raise TypeError(
                        "found non expected output name" + output_dict["type"]
                    )
            if "options" in settings_json:
                options = settings_json["options"]
                if "exportSrs" in options:
                    new_job_settings.options.export_srs = options["exportSrs"]
                if "minPhotos" in options:
                    new_job_settings.options.min_photos = int(options["minPhotos"])
                if "maxDist" in options:
                    new_job_settings.options.max_dist = float(options["maxDist"])
                if "useTiePoints" in options:
                    new_job_settings.options.use_tie_points = bool(options["useTiePoints"])
        except (KeyError, TypeError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        """
        Possible inputs for an Object 2D job.

        Attributes:
            photos: Path to ContextScene with oriented photos to analyze.
            photo_object_detector: Path to photo object detector to apply.
            objects2D: Given 2D objects.
            point_clouds: Collection of point clouds.
            meshes: Collection of meshes.
        """

        def __init__(self) -> None:
            self.photos: str = ""
            self.point_clouds: str = ""
            self.photo_object_detector: str = ""
            self.objects2D: str = ""
            self.meshes: str = ""

    class Outputs:
        """
        Possible outputs for an Object 2D job.

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

    class Options:
        """
        Possible outputs for an Object 2D job.

        Attributes:
            use_tie_points: Improve detection using tie points in photos.
            min_photos: Minimum number of 2D objects to generate a 3D object.
            max_dist: Maximum distance between photos and 3D objects.
            export_srs: SRS used by exports.
        """

        def __init__(self) -> None:
            self.use_tie_points: bool = False
            self.min_photos: int = 0
            self.max_dist: float = 0.0
            self.export_srs: str = ""


class S2DJobSettings:
    """
    Settings for Segmentation 2D jobs.

    Attributes:
        type: Type of job settings.
        inputs: Possible inputs for this job. Should be the ids of the inputs in the cloud.
        outputs: Possible outputs for this job. Fill the outputs you want for the job with a string (normally the name
            of the output) before passing the settings to create_job.
        options: Possible options for this job.
    """

    def __init__(self) -> None:
        self.type = RDAJobType.S2D
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()
        self.options = self.Options()

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
                {"type": "photos", "id": self.inputs.photos}
            )
        if self.inputs.photo_segmentation_detector:
            json_dict["inputs"].append(
                {
                    "type": "photoSegmentationDetector",
                    "id": self.inputs.photo_segmentation_detector,
                }
            )
        if self.inputs.point_clouds:
            json_dict["inputs"].append(
                {"type": "pointClouds", "id": self.inputs.point_clouds}
            )
        if self.inputs.meshes:
            json_dict["inputs"].append(
                {"type": "meshes", "id": self.inputs.meshes}
            )
        if self.inputs.segmentation2D:
            json_dict["inputs"].append(
                {"type": "segmentation2D", "id": self.inputs.segmentation2D}
            )
        json_dict["outputs"] = list()
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
        if self.outputs.polygons3D:
            json_dict["outputs"].append("polygons3D")
        if self.outputs.exported_polygons3D_DGN:
            json_dict["outputs"].append("exportedPolygons3DDGN")
        if self.outputs.exported_polygons3D_cesium:
            json_dict["outputs"].append("exportedPolygons3DCesium")
        json_dict["options"] = dict()
        if self.options.compute_line_width:
            json_dict["options"]["computeLineWidth"] = "true"
        if self.options.remove_small_components:
            json_dict["options"]["removeSmallComponents"] = str(self.options.remove_small_components)
        if self.options.export_srs:
            json_dict["options"]["exportSrs"] = self.options.export_srs
        if self.options.min_photos:
            json_dict["options"]["minPhotos"] = self.options.min_photos

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
                if input_dict["type"] == "photos":
                    new_job_settings.inputs.photos = input_dict["id"]
                elif input_dict["type"] == "photoSegmentationDetector":
                    new_job_settings.inputs.photo_segmentation_detector = input_dict[
                        "id"
                    ]
                elif input_dict["type"] == "pointClouds":
                    new_job_settings.inputs.point_clouds = input_dict["id"]
                elif input_dict["type"] == "meshes":
                    new_job_settings.inputs.meshes = input_dict["id"]
                elif input_dict["type"] == "segmentation2D":
                    new_job_settings.inputs.segmentation2D = input_dict["id"]
                else:
                    raise TypeError(
                        "found non expected input name:" + input_dict["type"]
                    )
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["type"] == "segmentation2D":
                    new_job_settings.outputs.segmentation2D = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "segmentedPhotos":
                    new_job_settings.outputs.segmented_photos = output_dict["id"]
                elif output_dict["type"] == "lines3D":
                    new_job_settings.outputs.lines3D = output_dict["id"]
                elif output_dict["type"] == "exportedLines3DDGN":
                    new_job_settings.outputs.exported_lines3D_DGN = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "exportedLines3DCesium":
                    new_job_settings.outputs.exported_lines3D_cesium = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "polygons3D":
                    new_job_settings.outputs.polygons3D = output_dict["id"]
                elif output_dict["type"] == "exportedPolygons3DDGN":
                    new_job_settings.outputs.exported_polygons3D_DGN = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "exportedPolygons3DCesium":
                    new_job_settings.outputs.exported_polygons3D_cesium = output_dict[
                        "id"
                    ]
                else:
                    raise TypeError(
                        "found non expected output name:" + output_dict["type"]
                    )
            if "options" in settings_json:
                options = settings_json["options"]
                if "computeLineWidth" in options:
                    new_job_settings.options.compute_line_width = bool(
                        options["computeLineWidth"]
                    )
                if "removeSmallComponents" in options:
                    new_job_settings.options.remove_small_components = float(
                        options["removeSmallComponents"]
                    )
                if "exportSrs" in options:
                    new_job_settings.options.export_srs = options["exportSrs"]

                if "minPhotos" in options:
                    new_job_settings.options.min_photos = int(options["minPhotos"])

        except (TypeError, KeyError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        """
        Possible inputs for a Segmentation 2D job.

        Attributes:
            photos: Path to ContextScene with photos to analyze.
            photo_segmentation_detector: Path to photo segmentation detector to apply.
            point_clouds: Collection of point clouds.
            meshes: Collection of meshes.
            segmentation2D: Given 2D segmentation.

        """

        def __init__(self) -> None:
            self.photos: str = ""
            self.photo_segmentation_detector: str = ""
            self.point_clouds: str = ""
            self.meshes: str = ""
            self.segmentation2D: str = ""

    class Outputs:
        """
        Possible outputs for a Segmentation 2D job.

        Attributes:
            segmentation2D: Segmented photos.
            segmented_photos: ContextScene pointing to segmented photos.
            lines3D: Detected 3D lines.
            exported_lines3D_DGN: DGN file export with 3D lines.
            exported_lines3D_cesium: Cesium 3D Tiles file export with 3D lines.
            polygons3D: Detected polygons.
            exported_polygons3D_DGN: DGN file export with polygons.
            exported_polygons3D_cesium: Cesium 3D Tiles file export with 3D polygons.

        """

        def __init__(self) -> None:
            self.segmentation2D: str = ""
            self.segmented_photos: str = ""
            self.lines3D: str = ""
            self.exported_lines3D_DGN: str = ""
            self.exported_lines3D_cesium: str = ""
            self.polygons3D: str = ""
            self.exported_polygons3D_DGN: str = ""
            self.exported_polygons3D_cesium: str = ""

    class Options:
        """
        Possible options for a Segmentation 2D job.

        Attributes:
            compute_line_width: Estimation 3D line width at each vertex.
            remove_small_components: Remove 3D lines with total length smaller than this value.
            export_srs: SRS used by exports.
            min_photos: minimum number of photos with a same class for a 3D point to have its class set
        """

        def __init__(self) -> None:
            self.compute_line_width: bool = False
            self.remove_small_components: float = 0.0
            self.export_srs: str = ""
            self.min_photos: int = 0


class EvalS2DJobSettings:
    """
    Settings for Segmentation 2D jobs.

    Attributes:
        type: Type of job settings.
        inputs: Possible inputs for this job. Should be the ids of the inputs in the cloud.
        outputs: Possible outputs for this job. Fill the outputs you want for the job with a string (normally the name
            of the output) before passing the settings to create_job.
        options: Possible options for this job.
    """

    def __init__(self) -> None:
        self.type = RDAJobType.EvalS2D
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()
        self.options = self.Options()

    def to_json(self) -> dict:
        """
        Transform settings into a dictionary compatible with json.

        Returns:
            Dictionary with settings values.
        """
        json_dict = dict()
        json_dict["inputs"] = list()
        json_dict["outputs"] = list()
        json_dict["inputs"].append(
            {
                "prediction": self.inputs.prediction
            },
        )
        json_dict["inputs"].append(
            {
                "reference": self.inputs.reference
            }
        )
        json_dict["outputs"].append(
            {
                "report": self.outputs.report
            }
        )
        json_dict["outputs"].append(
            {
                "segmentedPhotos": self.outputs.segmentedPhotos
            }
        )
        json_dict["outputs"].append(
            {
                "segmentation2D": self.outputs.segmentation2D
            }
        )
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
            new_job_settings.inputs.reference = settings_json["inputs"]["reference"]
            new_job_settings.inputs.prediction = settings_json["inputs"]["prediction"]
            new_job_settings.outputs.report = settings_json["outputs"]["report"]
            new_job_settings.outputs.segmentedPhotos = settings_json["outputs"]["segmentedPhotos"]
            new_job_settings.outputs.segmentation2D = settings_json["outputs"][
                "segmentation2D"]
        except (TypeError, KeyError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        """
        Possible inputs for a Segmentation 2D job.

        Attributes:
            photos: Path to ContextScene with photos to analyze.
            photo_segmentation_detector: Path to photo segmentation detector to apply.
            point_clouds: Collection of point clouds.
            meshes: Collection of meshes.
            segmentation2D: Given 2D segmentation.

        """

        def __init__(self) -> None:
            self.prediction: str = ""
            self.reference: str = ""

    class Outputs:
        """
        Possible outputs for a Segmentation 2D job.

        Attributes:
            segmentation2D: Segmented photos.
            segmented_photos: ContextScene pointing to segmented photos.
            lines3D: Detected 3D lines.
            exported_lines3D_DGN: DGN file export with 3D lines.
            exported_lines3D_cesium: Cesium 3D Tiles file export with 3D lines.
            polygons3D: Detected polygons.
            exported_polygons3D_DGN: DGN file export with polygons.
            exported_polygons3D_cesium: Cesium 3D Tiles file export with 3D polygons.

        """

        def __init__(self) -> None:
            self.report: str = ""
            self.segmentedPhotos: str = ""
            self.segmentation2D: str = ""

    class Options:
        """
        Possible options for a Segmentation 2D job.

        Attributes:
            compute_line_width: Estimation 3D line width at each vertex.
            remove_small_components: Remove 3D lines with total length smaller than this value.
            export_srs: SRS used by exports.
            min_photos: minimum number of photos with a same class for a 3D point to have its class set
        """


class SOrthoJobSettings:
    """
    Settings for Segmentation Ortho jobs.

    Attributes:
        type: Type of job settings.
        inputs: Possible inputs for this job. Should be the ids of the inputs in the cloud.
        outputs: Possible outputs for this job. Fill the outputs you want for the job with a string (normally the name
            of the output) before passing the settings to create_job.
    """

    def __init__(self) -> None:
        self.type = RDAJobType.SOrtho
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
        if self.inputs.orthophoto:
            json_dict["inputs"].append(
                {"type": "orthophoto", "id": self.inputs.orthophoto}
            )
        if self.inputs.orthophoto_segmentation_detector:
            json_dict["inputs"].append(
                {
                    "type": "orthophotoSegmentationDetector",
                    "id": self.inputs.orthophoto_segmentation_detector,
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
    def from_json(cls, settings_json: dict) -> ReturnValue[SOrthoJobSettings]:
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
                if input_dict["type"] == "orthophoto":
                    new_job_settings.inputs.orthophoto = input_dict["id"]
                elif input_dict["type"] == "orthophotoSegmentationDetector":
                    new_job_settings.inputs.orthophoto_segmentation_detector = (
                        input_dict["id"]
                    )
                else:
                    raise TypeError(
                        "found non expected input name:" + input_dict["type"]
                    )
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["type"] == "segmentation2D":
                    new_job_settings.outputs.segmentation2D = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "segmentedPhotos":
                    new_job_settings.outputs.segmented_photos = output_dict["id"]
                elif output_dict["type"] == "polygons2D":
                    new_job_settings.outputs.polygons2D = output_dict["id"]
                elif output_dict["type"] == "exportedPolygons2DSHP":
                    new_job_settings.outputs.exported_polygons2D_SHP = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "lines2D":
                    new_job_settings.outputs.lines2D = output_dict["id"]
                elif output_dict["type"] == "exportedLines2DDGN":
                    new_job_settings.outputs.exported_lines2D_DGN = output_dict["id"]
                elif output_dict["type"] == "exportedLines2DSHP":
                    new_job_settings.outputs.exported_lines2D_SHP = output_dict["id"]
                else:
                    raise TypeError(
                        "found non expected output type:" + output_dict["type"]
                    )
        except (TypeError, KeyError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        """
        Possible inputs for a Segmentation Ortho job.

        Attributes:
            orthophoto: Path to orthophoto to analyse.
            orthophoto_segmentation_detector: Path to orthophoto segmentation detector to apply.
        """

        def __init__(self) -> None:
            self.orthophoto: str = ""
            self.orthophoto_segmentation_detector: str = ""

    class Outputs:
        """
        Possible outputs for a Segmentation Ortho job.

        Attributes:
            segmentation2D: Segmented photos.
            segmented_photos: ContextScene pointing to segmented photos.
            polygons2D: Detected 2D polygons.
            exported_polygons2D_SHP: 2D polygons exported to ESRI shapefile.
            lines2D: Detected 2D lines.
            exported_lines2D_SHP: 2D lines exported to ESRI shapefile.
            exported_lines2D_DGN: 2D lines exported to DGN file.
        """

        def __init__(self) -> None:
            self.segmentation2D: str = ""
            self.segmented_photos: str = ""
            self.polygons2D: str = ""
            self.exported_polygons2D_SHP: str = ""
            self.lines2D: str = ""
            self.exported_lines2D_SHP: str = ""
            self.exported_lines2D_DGN: str = ""


class S3DJobSettings:
    """
    Settings for Segmentation 3D jobs.

    Attributes:
        type: Type of job settings.
        inputs: Possible inputs for this job. Should be the ids of the inputs in the cloud.
        outputs: Possible outputs for this job. Fill the outputs you want for the job with a string (normally the type
            of the output) before passing the settings to create_job.
        options: Possible options for this job.
    """

    def __init__(self) -> None:
        self.type = RDAJobType.S3D
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()
        self.options = self.Options()

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
                {"type": "pointClouds", "id": self.inputs.point_clouds}
            )
        if self.inputs.meshes:
            json_dict["inputs"].append(
                {"type": "meshes", "id": self.inputs.meshes}
            )
        if self.inputs.point_cloud_segmentation_detector:
            json_dict["inputs"].append(
                {
                    "type": "pointCloudSegmentationDetector",
                    "id": self.inputs.point_cloud_segmentation_detector,
                }
            )
        if self.inputs.segmentation3D:
            json_dict["inputs"].append(
                {"type": "segmentation3D", "id": self.inputs.segmentation3D}
            )
        if self.inputs.clip_polygon:
            json_dict["inputs"].append(
                {"type": "clipPolygon", "id": self.inputs.clip_polygon}
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
        if self.outputs.lines3D:
            json_dict["outputs"].append("lines3D")
        if self.outputs.exported_lines3D_DGN:
            json_dict["outputs"].append("exportedLines3DDGN")
        if self.outputs.exported_lines3D_cesium:
            json_dict["outputs"].append("exportedLines3DCesium")
        if self.outputs.polygons3D:
            json_dict["outputs"].append("polygons3D")
        if self.outputs.exported_polygons3D_DGN:
            json_dict["outputs"].append("exportedPolygons3DDGN")
        if self.outputs.exported_polygons3D_cesium:
            json_dict["outputs"].append("exportedPolygons3DCesium")
        json_dict["options"] = dict()
        if self.options.compute_line_width:
            json_dict["options"]["computeLineWidth"] = "true"
        if self.options.remove_small_components:
            json_dict["options"]["removeSmallComponents"] = str(self.options.remove_small_components)
        if self.options.save_confidence:
            json_dict["options"]["saveConfidence"] = "true"
        if self.options.export_srs:
            json_dict["options"]["exportSrs"] = self.options.export_srs

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
                if input_dict["type"] == "pointClouds":
                    new_job_settings.inputs.point_clouds = input_dict["id"]
                elif input_dict["type"] == "meshes":
                    new_job_settings.inputs.meshes = input_dict["id"]
                elif input_dict["type"] == "pointCloudSegmentationDetector":
                    new_job_settings.inputs.point_cloud_segmentation_detector = (
                        input_dict["id"]
                    )
                elif input_dict["type"] == "segmentation3D":
                    new_job_settings.inputs.segmentation3D = input_dict["id"]
                elif input_dict["type"] == "clipPolygon":
                    new_job_settings.inputs.clip_polygon = input_dict["id"]
                else:
                    raise TypeError(
                        "found non expected input type:" + input_dict["type"]
                    )

            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["type"] == "segmentation3D":
                    new_job_settings.outputs.segmentation3D = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "segmentedPointCloud":
                    new_job_settings.outputs.segmented_point_cloud = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "exportedSegmentation3DPOD":
                    new_job_settings.outputs.exported_segmentation3D_POD = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "exportedSegmentation3DLAS":
                    new_job_settings.outputs.exported_segmentation3D_LAS = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "exportedSegmentation3DLAZ":
                    new_job_settings.outputs.exported_segmentation3D_LAZ = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "exportedSegmentation3DPLY":
                    new_job_settings.outputs.exported_segmentation3D_PLY = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "objects3D":
                    new_job_settings.outputs.objects3D = output_dict["id"]
                elif output_dict["type"] == "exportedObjects3DDGN":
                    new_job_settings.outputs.exported_objects3D_DGN = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "exportedObjects3DCesium":
                    new_job_settings.outputs.exported_objects3D_cesium = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "exportedLocations3DSHP":
                    new_job_settings.outputs.exported_locations3D_SHP = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "lines3D":
                    new_job_settings.outputs.lines3D = output_dict["id"]
                elif output_dict["type"] == "exportedLines3DDGN":
                    new_job_settings.outputs.exported_lines3D_DGN = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "exportedLines3DCesium":
                    new_job_settings.outputs.exported_lines3D_cesium = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "polygons3D":
                    new_job_settings.outputs.polygons3D = output_dict["id"]
                elif output_dict["type"] == "exportedPolygons3DDGN":
                    new_job_settings.outputs.exported_polygons3D_DGN = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "exportedPolygons3DCesium":
                    new_job_settings.outputs.exported_polygons3D_cesium = output_dict[
                        "id"
                    ]
                else:
                    raise TypeError(
                        "found non expected output type:" + output_dict["type"]
                    )
            if "options" in settings_json:
                options = settings_json["options"]
                if "saveConfidence" in options:
                    new_job_settings.options.save_confidence = bool(options["saveConfidence"])
                if "computeLineWidth" in options:
                    new_job_settings.options.compute_line_width = bool(
                        options["computeLineWidth"]
                    )
                if "removeSmallComponents" in options:
                    new_job_settings.options.remove_small_components = float(
                        options["removeSmallComponents"]
                    )
                if "exportSrs" in options:
                    new_job_settings.options.export_srs = options["exportSrs"]
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
            clip_polygon: Path of clipping polygon to apply.
        """

        def __init__(self) -> None:
            self.point_clouds: str = ""
            self.meshes: str = ""
            self.point_cloud_segmentation_detector: str = ""
            self.segmentation3D: str = ""
            self.clip_polygon: str = ""

    class Outputs:
        """
        Possible outputs for a Segmentation 3D job.

        Attributes:
            segmentation3D: 3D segmentation computed by current job.
            segmented_point_cloud: 3D segmentation as an OPC file.
            exported_segmentation3D_POD: 3D segmentation exported as a POD file.
            exported_segmentation3D_LAS: 3D segmentation exported as a LAS file.
            exported_segmentation3D_LAZ: 3D segmentation exported as a LAZ file.
            exported_segmentation3D_PLY: 3D segmentation exported as a PLY file.
            objects3D: 3D objects inferred from 3D segmentation.
            exported_objects3D_DGN: DGN file export with 3D objects.
            exported_objects3D_cesium: Cesium 3D Tiles file export with 3D objects
            exported_locations3D_SHP: ESRI SHP file export with locations of the 3D objects
            lines3D: Detected 3D lines.
            exported_lines3D_DGN: DGN file export with 3D lines.
            exported_lines3D_cesium: Cesium 3D Tiles file export with 3D lines.
            polygons3D: Detected polygons.
            exported_polygons3D_DGN: DGN file export with polygons.
            exported_polygons3D_cesium: Cesium 3D Tiles file export with 3D polygons.
        """

        def __init__(self) -> None:
            self.segmentation3D: str = ""
            self.segmented_point_cloud: str = ""
            self.exported_segmentation3D_POD: str = ""
            self.exported_segmentation3D_LAS: str = ""
            self.exported_segmentation3D_LAZ: str = ""
            self.exported_segmentation3D_PLY: str = ""
            self.objects3D: str = ""
            self.exported_objects3D_DGN: str = ""
            self.exported_objects3D_cesium: str = ""
            self.exported_locations3D_SHP: str = ""
            self.lines3D: str = ""
            self.exported_lines3D_DGN: str = ""
            self.exported_lines3D_cesium: str = ""
            self.polygons3D: str = ""
            self.exported_polygons3D_DGN: str = ""
            self.exported_polygons3D_cesium: str = ""

    class Options:
        """
        Possible options for a Segmentation 3D job.

        Attributes:
            save_confidence: If confidence is saved in 3D segmentation files or not.
            compute_line_width: Estimation 3D line width at each vertex.
            remove_small_components: Remove 3D lines with total length smaller than this value.
            export_srs: SRS used by exports.
        """

        def __init__(self) -> None:
            self.save_confidence: bool = False
            self.compute_line_width: bool = False
            self.remove_small_components: float = 0.0
            self.export_srs: str = ""


class ChangeDetectionJobSettings:
    """
    Settings for Change Detection jobs.

    Attributes:
        type: Type of job settings.
        inputs: Possible inputs for this job. Should be the ids of the inputs in the cloud.
        outputs: Possible outputs for this job. Fill the outputs you want for the job with a string (normally the type
            of the output) before passing the settings to create_job.
        options: Possible options for this job.
    """

    def __init__(self) -> None:
        self.type = RDAJobType.ChangeDetection
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()
        self.options = self.Options()

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
                {"type": "pointClouds1", "id": self.inputs.point_clouds1}
            )
        if self.inputs.point_clouds2:
            json_dict["inputs"].append(
                {"type": "pointClouds2", "id": self.inputs.point_clouds2}
            )
        if self.inputs.meshes1:
            json_dict["inputs"].append(
                {"type": "meshes1", "id": self.inputs.meshes1}
            )
        if self.inputs.meshes2:
            json_dict["inputs"].append(
                {"type": "meshes2", "id": self.inputs.meshes2}
            )
        json_dict["outputs"] = list()
        if self.outputs.objects3D:
            json_dict["outputs"].append("objects3D")
        if self.outputs.exported_locations3D_SHP:
            json_dict["outputs"].append("exportedLocations3DSHP")
        json_dict["options"] = dict()
        if self.options.color_threshold_low:
            json_dict["options"]["colorThresholdLow"] = str(self.options.color_threshold_low)
        if self.options.color_threshold_high:
            json_dict["options"]["colorThresholdHigh"] = str(self.options.color_threshold_high)
        if self.options.dist_threshold_low:
            json_dict["options"]["distThresholdLow"] = str(self.options.dist_threshold_low)
        if self.options.dist_threshold_high:
            json_dict["options"]["distThresholdHigh"] = str(self.options.dist_threshold_high)
        if self.options.resolution:
            json_dict["options"]["resolution"] = str(self.options.resolution)
        if self.options.min_points:
            json_dict["options"]["minPoints"] = str(self.options.min_points)
        if self.options.export_srs:
            json_dict["options"]["exportSrs"] = self.options.export_srs
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
                if input_dict["type"] == "pointClouds1":
                    new_job_settings.inputs.point_clouds1 = input_dict["id"]
                elif input_dict["type"] == "pointClouds2":
                    new_job_settings.inputs.point_clouds2 = input_dict["id"]
                elif input_dict["type"] == "meshes1":
                    new_job_settings.inputs.meshes1 = input_dict["id"]
                elif input_dict["type"] == "meshes2":
                    new_job_settings.inputs.meshes2 = input_dict["id"]
                else:
                    raise TypeError(
                        "found non expected input type:" + input_dict["type"]
                    )
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["type"] == "objects3D":
                    new_job_settings.outputs.objects3D = output_dict["id"]
                elif output_dict["type"] == "exportedLocations3DSHP":
                    new_job_settings.outputs.exported_locations3D_SHP = output_dict[
                        "id"
                    ]
                else:
                    raise TypeError(
                        "found non expected output type:" + output_dict["type"]
                    )
            if "options" in settings_json:
                options = settings_json["options"]
                if "colorThresholdLow" in options:
                    new_job_settings.options.color_threshold_low = float(
                        options["colorThresholdLow"]
                    )
                if "colorThresholdHigh" in options:
                    new_job_settings.options.color_threshold_high = float(
                        options["colorThresholdHigh"]
                    )
                if "distThresholdLow" in options:
                    new_job_settings.options.dist_threshold_low = float(
                        options["distThresholdLow"]
                    )
                if "distThresholdHigh" in options:
                    new_job_settings.options.dist_threshold_high = float(
                        options["distThresholdHigh"]
                    )
                if "resolution" in options:
                    new_job_settings.options.resolution = float(options["resolution"])
                if "minPoints" in options:
                    new_job_settings.options.min_points = int(options["minPoints"])
                if "exportSrs" in options:
                    new_job_settings.options.export_srs = options["exportSrs"]
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

    class Options:
        """
        Possible options for a Change Detection 2D job.

        Attributes:
            color_threshold_low: Low threshold to detect color changes (hysteresis detection).
            color_threshold_high: High threshold to detect color changes (hysteresis detection).
            dist_threshold_low: Low threshold to detect spatial changes (hysteresis detection).
            dist_threshold_high: High threshold to detect spatial changes (hysteresis detection).
            resolution: Target point cloud resolution when starting from meshes.
            min_points: Minimum number of points in a region to be considered as a change.
            export_srs: SRS used by exports.
        """

        def __init__(self) -> None:
            self.color_threshold_low: float = 0.0
            self.color_threshold_high: float = 0.0
            self.dist_threshold_low: float = 0.0
            self.dist_threshold_high: float = 0.0
            self.resolution: float = 0.0
            self.min_points: int = 0
            self.export_srs: str = ""


class ExtractGroundJobSettings:
    """
    Settings for Extract Ground jobs. Will be available in an upcoming update.

    Attributes:
        type: Type of job settings.
        inputs: Possible inputs for this job. Should be the ids of the inputs in the cloud.
        outputs: Possible outputs for this job. Fill the outputs you want for the job with a string (normally the type
            of the output) before passing the settings to create_job.
        options: Possible options for this job
    """

    def __init__(self) -> None:
        self.type = RDAJobType.ExtractGround
        self.inputs = self.Inputs()
        self.outputs = self.Outputs()
        self.options = self.Options()

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
                {"type": "pointClouds", "id": self.inputs.point_clouds}
            )
        if self.inputs.meshes:
            json_dict["inputs"].append(
                {"type": "meshes", "id": self.inputs.meshes}
            )
        if self.inputs.point_cloud_segmentation_detector:
            json_dict["inputs"].append(
                {
                    "type": "pointCloudSegmentationDetector",
                    "id": self.inputs.point_cloud_segmentation_detector,
                }
            )
        if self.inputs.clip_polygon:
            json_dict["inputs"].append(
                {"type": "clipPolygon", "id": self.inputs.clip_polygon}
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
        json_dict["options"] = dict()
        if self.options.export_srs:
            json_dict["options"]["exportSrs"] = self.options.export_srs
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
                if input_dict["type"] == "pointClouds":
                    new_job_settings.inputs.point_clouds = input_dict["id"]
                elif input_dict["type"] == "meshes":
                    new_job_settings.inputs.meshes = input_dict["id"]
                elif input_dict["type"] == "pointCloudSegmentationDetector":
                    new_job_settings.inputs.point_cloud_segmentation_detector = (
                        input_dict["id"]
                    )
                elif input_dict["type"] == "clipPolygon":
                    new_job_settings.inputs.clip_polygon = input_dict["id"]
                else:
                    raise TypeError(
                        "found non expected input type:" + input_dict["type"]
                    )
            outputs_json = settings_json["outputs"]
            for output_dict in outputs_json:
                if output_dict["type"] == "segmentation3D":
                    new_job_settings.outputs.segmentation3D = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "segmentedPointCloud":
                    new_job_settings.outputs.segmented_point_cloud = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "exportedSegmentation3DPOD":
                    new_job_settings.outputs.exported_segmentation3D_POD = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "exportedSegmentation3DLAS":
                    new_job_settings.outputs.exported_segmentation3D_LAS = output_dict[
                        "id"
                    ]
                elif output_dict["type"] == "exportedSegmentation3DLAZ":
                    new_job_settings.outputs.exported_segmentation3D_LAZ = output_dict[
                        "id"
                    ]
                else:
                    raise TypeError(
                        "found non expected output type:" + output_dict["type"]
                    )
            if "options" in settings_json:
                options = settings_json["options"]
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

    class Options:
        """
        Possible options for an Extract Ground 2D job.

        Attributes:
            export_srs: SRS used by exports.
        """

        def __init__(self) -> None:
            self.export_srs: str = ""


JobSettings = TypeVar(
    "JobSettings",
    O2DJobSettings,
    S2DJobSettings,
    SOrthoJobSettings,
    S3DJobSettings,
    ChangeDetectionJobSettings,
    ExtractGroundJobSettings
)
