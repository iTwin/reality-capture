# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

from __future__ import annotations
from typing import List, Union, TypeVar

from reality_apis.utils import ReturnValue
from reality_apis.RC.rcs_enums import RCJobType


class ConversionSettings:
    """
    Settings for Conversion jobs.

    Attributes:
        type : Type of the job
        inputs: Possible inputs for this job. Lists of inputs ids in the cloud, divided by type of data.
        outputs: Possible outputs for this job. Fill the types of outputs you want for the job with True before passing
            the settings to create_job.
        options : List of optional parameters for this job.
    """

    def __init__(self) -> None:
        self.type: RCJobType = RCJobType.CONVERSION
        self.inputs: ConversionSettings.Inputs = self.Inputs()
        self.outputs: ConversionSettings.Outputs = self.Outputs()
        self.options: ConversionSettings.Options = self.Options()

    def to_json(self) -> dict:
        """
        Transform settings into a tuple of dictionaries compatible with json.

        Returns:
            Dictionary that contains inputs, outputs and options.
        """

        settings_dict = {"type": "Conversion", "inputs": list(), "outputs": list(), "options": dict()}

        for rd_id in self.inputs.las:
            settings_dict["inputs"].append({"id": rd_id})
        for rd_id in self.inputs.laz:
            settings_dict["inputs"].append({"id": rd_id})
        for rd_id in self.inputs.ply:
            settings_dict["inputs"].append({"id": rd_id})
        for rd_id in self.inputs.e57:
            settings_dict["inputs"].append({"id": rd_id})
        for rd_id in self.inputs.opc:
            settings_dict["inputs"].append({"id": rd_id})
        for rd_id in self.inputs.pointcloud:
            settings_dict["inputs"].append({"id": rd_id})

        if self.outputs.opc:
            settings_dict["outputs"].append("OPC")
        if self.outputs.pnts:
            settings_dict["outputs"].append("PNTS")

        if self.options.engines > 0:
            settings_dict["options"]["processingEngines"] = self.options.engines
        if not self.options.merge:
            settings_dict["options"]["merge"] = self.options.merge

        return settings_dict

    @classmethod
    def from_json(cls, settings_json: dict) -> ReturnValue[ConversionSettings]:
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
                    new_job_settings.inputs.las.append(input_dict["id"])
                elif input_dict["type"] == "LAZ":
                    new_job_settings.inputs.laz.append(input_dict["id"])
                elif input_dict["type"] == "PLY":
                    new_job_settings.inputs.ply.append(input_dict["id"])
                elif input_dict["type"] == "E57":
                    new_job_settings.inputs.e57.append(input_dict["id"])
                elif input_dict["type"] == "OPC":
                    new_job_settings.inputs.opc.append(input_dict["id"])
                elif input_dict["type"] == "PointCloud":
                    new_job_settings.inputs.pointcloud.append(input_dict["id"])
                else:
                    raise TypeError(
                        "found non expected input type:" + input_dict["type"]
                    )

            outputs_json = settings_json.get("outputs", [])

            for output_dict in outputs_json:
                if output_dict["type"] == "OPC":
                    new_job_settings.outputs.opc = []
                    new_job_settings.outputs.opc.append(output_dict["id"])
                elif output_dict["type"] == "PNTS":
                    new_job_settings.outputs.pnts = []
                    new_job_settings.outputs.pnts.append(output_dict["id"])
                else:
                    raise TypeError(
                        "found non expected output type" + output_dict["type"]
                    )

            options_json = settings_json.get("options", {})
            new_job_settings.options.engines = int(options_json.get("processingEngines", 0))
            new_job_settings.options.merge = bool(options_json.get("merge", True))

        except (KeyError, TypeError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        """
        Inputs for a Conversion job.

        Attributes:
            las: A list of paths to LAS files.
            laz: A list of paths to LAZ files.
            ply: A list of paths to PLY files.
            e57: A list of paths to E57 files.
            opc: A list of paths to OPC files.
            pointcloud: A list of paths to PointCloud files.
        """

        def __init__(self) -> None:
            self.las: List[str] = []
            self.laz: List[str] = []
            self.ply: List[str] = []
            self.e57: List[str] = []
            self.opc: List[str] = []
            self.pointcloud: List[str] = []

    class Outputs:
        """
        Outputs for a Conversion job.

        Attributes:
            opc: Either a boolean to indicate conversion type or a list of created OPC files ids.
            pnts: Either a boolean to indicate conversion type or a list of created PNTS files ids.
        """

        def __init__(self) -> None:
            self.opc: Union[bool, List[str]] = False
            self.pnts: Union[bool, List[str]] = False

    class Options:
        """
        Options for a Conversion job.

        Attributes:
            merge: If true, all the input files from multiple containers will be merged into one output file.
            Else output file will be created per input file.
            engines: Quantity of engines to be used by the job.
        """

        def __init__(self) -> None:
            self.merge: bool = True
            self.engines: int = 0


class ImportFeaturesSettings:
    """
    Settings for ImportFeatures jobs.

    Attributes:
        type : Type of the job
        inputs: Possible inputs for this job. Lists of inputs ids in the cloud, divided by type of data.
        outputs: Possible outputs for this job. Fill the types of outputs you want for the job with True before passing
            the settings to create_job.
        options : List of optional parameters for this job.
    """

    def __init__(self) -> None:
        self.type: RCJobType = RCJobType.IMPORT_FEATURES
        self.inputs: ImportFeaturesSettings.Inputs = self.Inputs()
        self.outputs: ImportFeaturesSettings.Outputs = self.Outputs()
        self.options: ImportFeaturesSettings.Options = self.Options()

    def to_json(self) -> dict:
        """
        Transform settings into a tuple of dictionaries compatible with json.

        Returns:
            Dictionary that contains inputs, outputs and options.
        """

        settings_dict = {"type": "ImportFeatures", "inputs": list(), "outputs": list(), "options": dict()}

        for rd_id in self.inputs.context_scene:
            settings_dict["inputs"].append({"id": rd_id})
        for rd_id in self.inputs.shp:
            settings_dict["inputs"].append({"id": rd_id})
        for rd_id in self.inputs.geojson:
            settings_dict["inputs"].append({"id": rd_id})
        for rd_id in self.inputs.ovf:
            settings_dict["inputs"].append({"id": rd_id})
        for rd_id in self.inputs.ovt:
            settings_dict["inputs"].append({"id": rd_id})

        if self.outputs.fdb:
            settings_dict["outputs"].append("fdb")

        if len(self.options.input_srs) > 0:
            settings_dict["options"]["InputSRS"] = self.options.input_srs
        if len(self.options.output_srs) > 0:
            settings_dict["options"]["OutputSRS"] = self.options.output_srs

        return settings_dict

    @classmethod
    def from_json(cls, settings_json: dict) -> ReturnValue[ImportFeaturesSettings]:
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
                if input_dict["type"] == "ContextScene":
                    new_job_settings.inputs.context_scene.append(input_dict["id"])
                elif input_dict["type"] == "SHP":
                    new_job_settings.inputs.shp.append(input_dict["id"])
                elif input_dict["type"] == "GeoJSON":
                    new_job_settings.inputs.geojson.append(input_dict["id"])
                elif input_dict["type"] == "OVF":
                    new_job_settings.inputs.ovf.append(input_dict["id"])
                elif input_dict["type"] == "OVT":
                    new_job_settings.inputs.ovt.append(input_dict["id"])
                else:
                    raise TypeError(
                        "found non expected input type:" + input_dict["type"]
                    )

            outputs_json = settings_json.get("outputs", [])

            for output_dict in outputs_json:
                if output_dict["type"] == "FDB":
                    new_job_settings.outputs.fdb = []
                    new_job_settings.outputs.fdb.append(output_dict["id"])
                else:
                    raise TypeError(
                        "found non expected output type" + output_dict["type"]
                    )

            options_json = settings_json.get("options", {})
            new_job_settings.options.input_srs = options_json.get("InputSRS", "")
            new_job_settings.options.output_srs = options_json.get("OutputSRS", "")

        except (KeyError, TypeError) as e:
            return ReturnValue(value=cls(), error=str(e))
        return ReturnValue(value=new_job_settings, error="")

    class Inputs:
        """
        Inputs for an ImportFeatures job.

        Attributes:
            context_scene: A list of paths to Context Scene files.
            shp: A list of paths to SHP files.
            geojson: A list of paths to GeoJSON files.
            ovf: A list of paths to OVF files.
            ovt: A list of paths to OVT files.
        """

        def __init__(self) -> None:
            self.context_scene: List[str] = []
            self.shp: List[str] = []
            self.geojson: List[str] = []
            self.ovf: List[str] = []
            self.ovt: List[str] = []

    class Outputs:
        """
        Outputs for an ImportFeatures job.

        Attributes:
            fdb: opc: Either a boolean to indicate conversion type or a list of created FDB files ids.
        """

        def __init__(self) -> None:
            self.fdb: Union[bool, List[str]] = False

    class Options:
        """
        Options for an ImportFeatures job.

        Attributes:
            input_srs: Defines the horizontal or horizontal+vertical EPSG codes of the CRS
            (coordinate reference system) of the input files
            output_srs: Defines the horizontal or horizontal+vertical EPSG codes of the CRS
            (coordinate reference system) of the output files
        """

        def __init__(self) -> None:
            self.input_srs: str = ""
            self.output_srs: str = ""


JobSettings = TypeVar(
    "JobSettings",
    ConversionSettings,
    ImportFeaturesSettings,
)
