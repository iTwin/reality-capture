from pydantic import BaseModel, Field
from typing import Optional


class GaussianSplats(BaseModel):
    quality: Optional[int] = Field(description="Quality (0 = Moderate, 1 = Standard, 2 = Maximum)", alias="Quality")
    gs_format: Optional[int] = Field(description="Format (0 = PLY, 1 = SPZ, 2 = 3D Tiles)", alias="GSFormat")
    cleaning: Optional[int] = Field(description="Cleaning (0 = None, 1 = Minimal, 2 = Moderate, 3 = Extensive)", alias="Cleaning")
    keep_outside_splats: Optional[bool] = Field(description="Keep splats outside of ROI", alias="KeepOutsideSplats")


class SplatSettings(BaseModel):
    gs: GaussianSplats = Field(description="Gaussian Splats dedicated settings", alias="GS")


class Settings(BaseModel):
    name: str = Field(description="Name of the export format (GaussianSplats in your case)")
    settings: SplatSettings = Field(description="Settings for splats")


class ProdSettingsExchange(BaseModel):
    production_settings_exchange: list[Settings] = Field(alias="ProductionSettingsExchange")


print(ProdSettingsExchange.model_json_schema(by_alias=True))
