from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ImportFeaturesInputs(BaseModel):
    context_scene: Optional[list[str]] = Field(None, alias="contextScene",
                                               description="A list of paths to Context Scene files")
    shp: Optional[list[str]] = Field(None, description="A list of paths to SHP files")
    geojson: Optional[list[str]] = Field(None, description="A list of paths to GeoJSON files")
    ovf: Optional[list[str]] = Field(None, description="A list of paths to OVF files.")
    ovt: Optional[list[str]] = Field(None, description="A list of paths to OVT files.")


class ImportFeaturesOutputs(BaseModel):
    fdb: Optional[list[str]] = Field(None, description="List of created FDB files")


class ImportFeaturesOutputsCreate(Enum):
    FDB = "fdb"


class ImportFeaturesOptions(BaseModel):
    input_srs: Optional[str] = Field(None, alias="inputSrs", description="Defines the horizontal or "
                                                                         "horizontal+vertical EPSG codes of the CRS "
                                                                         "(coordinate reference system) "
                                                                         "of the input files")
    output_srs: Optional[str] = Field(None, alias="outputSrs", description="Defines the horizontal or "
                                                                           "horizontal+vertical EPSG codes of the "
                                                                           "CRS(coordinate reference system) "
                                                                           "of the output files")


class ImportFeaturesSpecificationsCreate(BaseModel):
    inputs: ImportFeaturesInputs = Field(description="Inputs")
    outputs: list[ImportFeaturesOutputsCreate] = Field(description="Outputs")
    options: Optional[ImportFeaturesOptions] = Field(None, description="Options")


class ImportFeaturesSpecifications(BaseModel):
    inputs: ImportFeaturesInputs = Field(description="Inputs")
    outputs: ImportFeaturesOutputs = Field(description="Outputs")
    options: Optional[ImportFeaturesOptions] = Field(None, description="Options")
