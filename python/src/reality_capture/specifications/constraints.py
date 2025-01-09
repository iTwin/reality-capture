from pydantic import BaseModel, Field, UUID4
from typing import Optional
from enum import Enum


class ConstraintType(Enum):
    MESH = "Mesh"
    POLYGON = "Polygon"


class ConstraintToAdd(BaseModel):
    constraint_path: str = Field(alias="constraintPath", description="Path to the constraint file")
    srs: str = Field(description="Spatial reference system")
    type: Optional[ConstraintType] = Field(None, description="Type of the constraint")
    resolution: Optional[float] = Field(None, description="Resolution of the constraint")
    texture_path: Optional[str] = Field(None, alias="texturePath", description="Path to the texture file")
    texture_size: Optional[int] = Field(None, alias="textureSize", description="Size of the texture")
    fill_color: Optional[str] = Field(None, alias="fillColor", description="Fill color for the constraint")
    name: Optional[str] = Field(None, description="Name of the constraint")
    description: Optional[str] = Field(None, description="Description of the constraint")


class ConstraintInfo(ConstraintToAdd):
    id: UUID4 = Field(description="Constraint unique id")
    surfaces: list[str] = Field(description="List of meshes")
    srs_surfaces: str = Field(alias="srsSurfaces", description="Reference System of surfaces")


class ConstraintsInfo(BaseModel):
    constraints = list[ConstraintInfo] = Field(description="Constraints information")


class ConstraintsInputs(BaseModel):
    reference_model: str = Field(alias="referenceModel", description="Reality data id of ContextScene to process")
    constraints_to_delete: Optional[list[UUID4]] = Field(None, alias="constraintsToDelete",
                                                         description="IDs of constraints to delete")
    constraints_to_add: Optional[list[ConstraintToAdd]] = Field(None, alias="constraintsToAdd",
                                                                description="Constraints to add")


class ConstraintsOutputs(BaseModel):
    added_constraints_info: str = Field(alias="addedConstraintsInfo",
                                        description="Reality data id of container for added ConstraintsInfo")


class ConstraintsOutputsCreate(Enum):
    ADDED_CONSTRAINTS_INFO = "addedConstraintsInfo"


class ConstraintsSpecifications(BaseModel):
    inputs: ConstraintsInputs = Field(description="Inputs")
    outputs: ConstraintsOutputs = Field(description="Outputs")


class ConstraintsSpecificationsCreate(BaseModel):
    inputs: ConstraintsInputs = Field(description="Inputs")
    outputs: list[ConstraintsOutputsCreate] = Field(description="Outputs")
