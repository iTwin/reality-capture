from pydantic import BaseModel, Field, model_validator
from typing import Optional
from enum import Enum


class PCConversionInputs(BaseModel):
    point_clouds: list[str] = Field(description="Reality data Ids of point clouds to convert", alias="pointClouds")


class PCConversionOutputsCreate(Enum):
    OPC = "opc"
    PNTS = "pnts"
    GLB = "glb"
    GLBC = "glbc"


class PCConversionOutputs(BaseModel):
    opc: Optional[str] = Field(None, description="Id of the conversion as Orbit Point Cloud.")
    pnts: Optional[str] = Field(None, description="Id of the conversion as Cesium 3D Point Cloud")

    @model_validator(mode='after')
    def only_one_field(cls, model):
        """
        Checks that one and only one field is provided.
        """
        if (model.opc and model.pnts) or (not model.opc and not model.pnts):
            raise ValueError("Exactly one of 'opc' or 'pnts' must be provided.")
        return model


class PCConversionOptions(BaseModel):
    merge: Optional[bool] = Field(None, description="If true, when possible and if relevant, all the files in the "
                                                    "input reality data will be merged as one file.")


class PointCloudConversionSpecificationsCreate(BaseModel):
    inputs: PCConversionInputs = Field(description="Inputs")
    outputs: PCConversionOutputsCreate = Field(description="Outputs")
    options: Optional[PCConversionOptions] = Field(None, description="Options")


class PointCloudConversionSpecifications(BaseModel):
    inputs: PCConversionInputs = Field(description="Inputs")
    outputs: PCConversionOutputs = Field(description="Outputs")
    options: Optional[PCConversionOptions] = Field(None, description="Options")
