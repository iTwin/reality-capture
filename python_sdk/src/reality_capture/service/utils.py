from pydantic import BaseModel, Field


class Link(BaseModel):
    href: str = Field(description="The URL.")