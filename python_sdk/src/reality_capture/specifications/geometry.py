from pydantic import BaseModel, Field
from typing import Optional


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


class Coords2d(BaseModel):
    x: float = Field(description="X coordinate")
    y: float = Field(description="Y coordinate")


class Polygon2DWithHoles(BaseModel):
    outsideBounds: list[Coords2d] = Field(description="Outside bounds of the polygon")
    holes: Optional[list[list[Coords2d]]] = Field(default=None, description="List of holes boundaries if any")


class RegionOfInterest(BaseModel):
    crs: str = Field(description="Definition of the Region of Interest Coordinate System")
    polygons: list[Polygon2DWithHoles] = Field(description="List of polygons")
    altitude_min: float = Field(description="Minimum altitude", alias="altitudeMin")
    altitude_max: float = Field(description="Maximum altitude", alias="altitudeMax")
