from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class VectorOptimizationInputs(BaseModel):
    vectors: list[str] = Field(description="Reality data Ids of vectors to consolidate")


class VectorOptimizationFormat(Enum):
    GEO_JSON = "GeoJSON"
    FEATURE_DB = "FeatureDB"


class VectorOptimizationOptions(BaseModel):
    out_format: Optional[VectorOptimizationFormat] = Field(None, description="Output format for the conversion.",
                                                     alias="format")
    input_crs: Optional[str] = Field(None, description="CRS for the input data", alias="inputCrs")
    output_crs: Optional[str] = Field(None, description="CRS for the output data", alias="outputCrs")
    feature_class_display_name: Optional[str] = Field(None, description="Display class name",
                                                      alias="featureClassDisplayName")


class VectorOptimizationSpecificationsCreate(BaseModel):
    inputs: VectorOptimizationInputs = Field(description="Inputs")
    options: Optional[VectorOptimizationOptions] = Field(None, description="Options")


class VectorOptimizationSpecifications(BaseModel):
    inputs: VectorOptimizationInputs = Field(description="Inputs")
    outputs: str = Field(description="Reality Data id of the vector data or Feature DB index (fdb:)")
    options: Optional[VectorOptimizationOptions] = Field(None, description="Options")
