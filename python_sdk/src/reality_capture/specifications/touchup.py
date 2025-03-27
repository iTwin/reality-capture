from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class TouchUpExportInputs(BaseModel):
    reference_model: str = Field(alias="referenceModel", description="Reality data id of Reference Model")
    tiles_to_touch_up: Optional[list[str]] = Field(None, alias="tilesToTouchUp",
                                                   description="List of tiles to export for touch up")


class TouchFormat(Enum):
    OBJ = "OBJ"
    DGN = "DGN"


class TouchLevel(Enum):
    GEOMETRY = "Geometry"
    GEOMETRY_AND_TEXTURE = "GeometryAndTexture"


class TouchUpExportOptions(BaseModel):
    format: Optional[TouchFormat] = Field(None, description="Touch Up format")
    level: Optional[TouchLevel] = Field(None, description="Touch Up level")
    crs: Optional[str] = Field(None, description="Export CRS")


class TouchUpExportOutputsCreate(Enum):
    TOUCH_UP_DATA = "touchUpData"


class TouchUpExportOutputs(BaseModel):
    touch_up_data: str = Field(alias="touchUpData", description="Reality Data id for touch up data")


class TouchUpExportSpecifications(BaseModel):
    inputs: TouchUpExportInputs = Field(description="Inputs")
    outputs: TouchUpExportOutputs = Field(description="Outputs")
    options: Optional[TouchUpExportOptions] = Field(None, description="Options")


class TouchUpExportSpecificationsCreate(BaseModel):
    inputs: TouchUpExportInputs = Field(description="Inputs")
    outputs: list[TouchUpExportOutputsCreate] = Field(description="Outputs")
    options: Optional[TouchUpExportOptions] = Field(None, description="Options")


class TouchUpExportCost(BaseModel):
    tile_count: int = Field(description="Number of tiles to export", alias="tileCount", ge=0)


class TouchUpImportInputs(BaseModel):
    reference_model: str = Field(alias="referenceModel", description="Reality data id of Reference Model")
    touch_up_data: str = Field(alias="touchUpData", description="Reality Data id for touch up data")


class TouchUpImportSpecifications(BaseModel):
    inputs: TouchUpImportInputs = Field(description="Inputs")


class TouchUpImportCost(BaseModel):
    tile_count: int = Field(description="Number of tiles to import", alias="tileCount", ge=0)
