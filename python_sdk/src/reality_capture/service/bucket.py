from pydantic import BaseModel, Field
from reality_capture.service.reality_data import ContainerLinks


class Bucket(BaseModel):
    itwin_id: str = Field(description="iTwin Id for the bucket.", alias="iTwinId")


class BucketResponse(BaseModel):
    bucket: Bucket = Field(description="Bucket information")
    links: ContainerLinks = Field(description="The link to the container.", alias="_links")
