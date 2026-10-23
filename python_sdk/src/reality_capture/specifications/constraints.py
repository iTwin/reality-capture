from pydantic import BaseModel, Field, UUID4
from typing import Optional
from enum import Enum


class ConstraintType(str, Enum):
    MESH = "Mesh"
    POLYGON = "Polygon"


class ConstraintToAdd(BaseModel):
    constraint_path: str = Field(alias="constraintPath",
                                 description="Path to constraint file (bucket path in cloud, local path on-premise)")
    crs: str = Field(description="Coordinate reference system")
    type: Optional[ConstraintType] = Field(None, description="Type of the constraint")
    resolution: Optional[float] = Field(None, description="Resolution of the constraint")
    texture_path: Optional[str] = Field(None, alias="texturePath",
                                        description="Path to texture file (bucket path in cloud, local path on-premise)")
    texture_size: Optional[int] = Field(None, alias="textureSize", description="Size of the texture")
    fill_color: Optional[str] = Field(None, alias="fillColor", description="Fill color for the constraint")
    name: Optional[str] = Field(None, description="Name of the constraint")
    description: Optional[str] = Field(None, description="Description of the constraint")


class ConstraintInfo(ConstraintToAdd):
    id: UUID4 = Field(description="Constraint unique id")
    surfaces: list[str] = Field(description="List of meshes")
    crs_surfaces: str = Field(alias="crsSurfaces", description="Coordinate Reference System of surfaces")


class ConstraintsInfo(BaseModel):
    constraints: list[ConstraintInfo] = Field(description="Constraints information")


class ConstraintsInputs(BaseModel):
    modeling_reference: str = Field(alias="modelingReference", description="Modeling reference to update.")
    constraints_to_delete: Optional[list[UUID4]] = Field(None, alias="constraintsToDelete",
                                                         description="IDs of constraints to delete")
    constraints_to_add: Optional[list[ConstraintToAdd]] = Field(None, alias="constraintsToAdd",
                                                                description="Constraints to add")
    crs_data: Optional[str] = Field(default=None,
                                    description="Path to CRS data file (bucket path in cloud, local path on-premise).",
                                    alias="crsData")


class ConstraintsOutputs(BaseModel):
    added_constraints_info: str = Field(alias="addedConstraintsInfo",
                                        description="Path to added ConstraintsInfo file (bucket path in cloud, local path on-premise)",)


class ConstraintsOutputsCreate(Enum):
    ADDED_CONSTRAINTS_INFO = "addedConstraintsInfo"


class ConstraintsSpecifications(BaseModel):
    inputs: ConstraintsInputs = Field(description="Inputs")
    outputs: ConstraintsOutputs = Field(description="Outputs")


class ConstraintsSpecificationsCreate(BaseModel):
    inputs: ConstraintsInputs = Field(description="Inputs")
    outputs: list[ConstraintsOutputsCreate] = Field(description="Outputs")


class ConstraintsCost(BaseModel):
    surface: float = Field(description="Surface in squared meters of the constraints to add", ge=0)
