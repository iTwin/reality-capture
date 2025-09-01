from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class TouchUpExportInputs(BaseModel):
    modeling_reference: str = Field(alias="modelingReference", description="Reality data id of Modeling Reference")
    tiles_to_touch_up: Optional[list[str]] = Field(None, alias="tilesToTouchUp",
                                                   description="List of tiles to export for touch up")


class TouchLevel(Enum):
    GEOMETRY = "Geometry"
    GEOMETRY_AND_TEXTURE = "GeometryAndTexture"


class TouchUpExportOptions(BaseModel):
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
    modeling_reference: str = Field(alias="modelingReference", description="Reality data id of Modeling Reference")
    touch_up_data: str = Field(alias="touchUpData", description="Reality Data id for touch up data")


class TouchUpImportOutputsCreate(Enum):
    IMPORT_INFO = "importInfo"


class TouchUpImportOutputs(BaseModel):
    import_info: Optional[str] = Field(None, alias="importInfo", description="Folder in bucket containing the "
                                                                             "information about what was imported",
                                       pattern=r"^bkt:.+")


class TouchUpImportSpecificationsCreate(BaseModel):
    inputs: TouchUpImportInputs = Field(description="Inputs")
    outputs: list[TouchUpImportOutputsCreate] = Field(description="Outputs")


class TouchUpImportSpecifications(BaseModel):
    inputs: TouchUpImportInputs = Field(description="Inputs")
    outputs: TouchUpImportOutputs = Field(description="Outputs")


class TouchUpImportCost(BaseModel):
    tile_count: int = Field(description="Number of tiles to import", alias="tileCount", ge=0)


class ImportTileInfo(BaseModel):
    tile_name: str = Field(alias="tileName", description="Name of an imported tile")
    level: TouchLevel = Field(description="Touch up level of imported tile")


class ImportInfo(BaseModel):
    import_info: list[ImportTileInfo] = Field(alias="importInfo", description="List of tiles imported")
