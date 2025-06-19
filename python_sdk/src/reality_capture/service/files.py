from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class FileType(Enum):
    PRESET = "Preset"


class File(BaseModel):
    id: str = Field(description="Id of the file")
    name: str = Field(description="Display name of the file", min_length=3, max_length=256)
    type: FileType = Field(description="File type")
    description: Optional[str] = Field(None, description="Description of the file")
    deprecated: Optional[bool] = Field(None, description="If true, this file won't be available in a long term future.")


class Files(BaseModel):
    files: list[File] = Field(description="List of files")
