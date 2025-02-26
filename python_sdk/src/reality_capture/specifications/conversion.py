from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ConversionInputs(BaseModel):
    las: Optional[list[str]] = Field(None, description="A list of paths to LAS files")
    laz: Optional[list[str]] = Field(None, description="A list of paths to LAZ files")
    ply: Optional[list[str]] = Field(None, description="A list of paths to PLY files")
    e57: Optional[list[str]] = Field(None, description="A list of paths to E57 files")


class ConversionOutputs(BaseModel):
    opc: Optional[list[str]] = Field(None, description="List of created OPC files")
    pnts: Optional[list[str]] = Field(None, description="List of created PNTS files")


class ConversionOutputsCreate(Enum):
    OPC = "opc"
    PNTS = "pnts"


class ConversionOptions(BaseModel):
    merge: Optional[bool] = Field(None, description="If true, all the input files from multiple containers "
                                                    "will be merged into one output file. "
                                                    "Else output file will be created per input file")
    engines: Optional[int] = Field(None, description="Quantity of engines to be used by the job")


class ConversionSpecificationsCreate(BaseModel):
    inputs: ConversionInputs = Field(description="Inputs")
    outputs: list[ConversionOutputsCreate] = Field(description="Outputs")
    options: Optional[ConversionOptions] = Field(None, description="Options")


class ConversionSpecifications(BaseModel):
    inputs: ConversionInputs = Field(description="Inputs")
    outputs: ConversionOutputs = Field(description="Outputs")
    options: Optional[ConversionOptions] = Field(None, description="Options")
