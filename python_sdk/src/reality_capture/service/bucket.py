from pydantic import BaseModel, Field
from reality_capture.service.reality_data import ContainerLinks


class Bucket(BaseModel):
    id: str = Field(description="Bucket unique identifier.")
    itwin_id: str = Field(description="iTwin Id for the bucket.", alias="itwinId")
    is_default: bool = Field(description="Indicate if the bucket is the default one for the iTwin.",
                             alias="isDefault")


class BucketResponse(BaseModel):
    bucket: Bucket = Field(description="Bucket information")
    links: ContainerLinks = Field(description="The link to the container.", alias="_links")
