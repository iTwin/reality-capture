from pydantic import BaseModel, Field
from typing import Optional


class Error(BaseModel):
    code: str = Field(description="One of a server-defined set of error codes.")
    message: str = Field(description="A human-readable representation of the error.")
    target: Optional[str] = Field(None, description="The target of the error.")


class DetailedError(BaseModel):
    code: str = Field(description="One of a server-defined set of error codes.")
    message: str = Field(description="A human-readable representation of the error.")
    target: Optional[str] = Field(None, description="The target of the error.")
    details: Optional[list[Error]] = Field(None, description="Array of more specific errors.")


class DetailedErrorResponse(BaseModel):
    error: DetailedError = Field(description="Detailed error information.")
