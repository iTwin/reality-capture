from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    xmin: float = Field(description="X coordinate of the minimum corner")
    ymin: float = Field(description="Y coordinate of the minimum corner")
    zmin: float = Field(description="Z coordinate of the minimum corner")
    xmax: float = Field(description="X coordinate of the maximum corner")
    ymax: float = Field(description="Y coordinate of the maximum corner")
    zmax: float = Field(description="Z coordinate of the maximum corner")


class Point3d(BaseModel):
    x: float = Field(description="X coordinate")
    y: float = Field(description="Y coordinate")
    z: float = Field(description="Z coordinate")