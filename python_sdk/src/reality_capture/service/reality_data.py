from pydantic import BaseModel, Field
from typing import Optional, Union, Tuple
from enum import Enum
from datetime import datetime
from urllib.parse import urlparse, parse_qs


class Classification(Enum):
    TERRAIN = "Terrain"
    IMAGERY = "Imagery"
    PINNED = "Pinned"
    MODEL = "Model"
    UNDEFINED = "Undefined"


class Type(Enum):
    CC_IMAGE_COLLECTION = "CCImageCollection"
    CESIUM_3D_TILES = "Cesium3DTiles"
    COLLADA = "DAE"
    CONSTRAINTS = "ConstraintsInformation"
    CONTEXT_DETECTOR = "ContextDetector"
    CONTEXT_SCENE = "ContextScene"
    DGN = "DGN"
    FBX = "FBX"
    KML = "KML"
    LAS = "LAS"
    LAZ = "LAZ"
    LOD = "LOD"
    LOD_TREE = "LODTree"
    OBJ = "OBJ"
    OPC = "OPC"
    ORTHOPHOTO_DSM = "OrthophotoDSM"
    OSGB = "OSGB"
    PLY = "PLY"
    PNTS = "PNTS"
    POD = "PointCloud"
    REALITY_MESH_3D_Tiles = "RealityMesh3DTiles"
    REFERENCE_MODEL = "ModelingReference"
    SLPK = "SLPK"
    SPACEYES = "SpaceEyes3D"
    SUPER_MAP = "SuperMap"
    S3C = "S3C"
    TERRAIN_3D_TILES = "Terrain3DTiles"
    TEXTURED_TIE_POINTS = "TexturedTiePoints"
    THREESM = "3SM"
    THREEMX = "3MX"
    TOUCHUP = "TouchUpData"
    UNSTRUCTURED_DATA = "Unstructured"


class Acquisition(BaseModel):
    start_date_time: Optional[datetime] = Field(None, alias="startDateTime",
                                                description="ISO-8601 compliant time (UTC) that indicates when the "
                                                            "data acquisition started.")
    end_date_time: Optional[datetime] = Field(None, alias="endDateTime",
                                              description="ISO-8601 compliant time (UTC) that indicates when the "
                                                          "data acquisition ended.")
    acquirer: Optional[str] = Field(None, description="Description of the acquirer.")


class Coordinate(BaseModel):
    latitude: float = Field(description="Latitude in degrees.", ge=-90, le=90)
    longitude: float = Field(description="Longitude in degrees.", ge=-180, le=180)


class Extent(BaseModel):
    south_west: Coordinate = Field(description="Extent's southwest coordinate.", alias="southWest")
    north_east: Coordinate = Field(description="Extent's northeast coordinate.", alias="northEast")


class RealityDataBase(BaseModel):
    classification: Optional[Classification] = Field(None, description="Specific value constrained field that "
                                                                       "indicates the nature of the reality data.")
    description: Optional[str] = Field(None, description="Description of the reality data.")
    tags: Optional[list[str]] = Field(None, description="Any strings identifier which you can assign to reality data"
                                                        " to identify it.")
    dataset: Optional[str] = Field(None, description="This field can be used to define a loose grouping of reality "
                                                     "data. This property may not contain any control sequence such "
                                                     "as a URL or code.")
    group: Optional[str] = Field(None, description="The group can be used to define a second level of grouping. This "
                                                   "property may not contain any control sequence such as a URL or "
                                                   "code.")
    root_document: Optional[str] = Field(None, description="Used to indicate the root document of the reality data.",
                                         alias="rootDocument")
    acquisition: Optional[Acquisition] = Field(None, description="Details about data acquisition.")
    extent: Optional[Extent] = Field(None, description="The rectangular area on the Earth which encloses the reality "
                                                       "data.")
    authoring: Optional[bool] = Field(None, description="A boolean value that is true if the data is being created. "
                                                        "It is false if the data has been completely uploaded.")
    owner_id: Optional[str] = Field(None, description="Identifier of the owner of the reality data.", alias="ownerId")


class RealityDataCreate(RealityDataBase):
    itwin_id: str = Field(description="Id of associated iTwin.", alias="iTwinId")
    display_name: str = Field(description="Name of the reality data.", alias="displayName")
    type: Type = Field(description="A key indicating the format of the data.")


class RealityData(RealityDataBase):
    id: str = Field(description="Identifier of the reality data. This identifier is assigned by the service at the "
                                "creation of the reality data. It is also unique.")
    display_name: str = Field(description="Name of the reality data.", alias="displayName")
    created_date_time: datetime = Field(description="ISO-8601 compliant time (UTC) of the creation of "
                                                    "the reality data.", alias="createdDateTime")
    modified_date_time: datetime = Field(description="ISO-8601 compliant time (UTC) of last access of "
                                                     "the reality data.", alias="modifiedDateTime")
    last_accessed_date_time: datetime = Field(description="ISO-8601 compliant time (UTC) of the creation of "
                                                          "the reality data.", alias="lastAccessedDateTime")
    data_center_location: str = Field(description="Identifies the data center location used to store the reality data.",
                                      alias="dataCenterLocation")
    size: int = Field(description="The size of the reality data in Kilobytes.", ge=0)
    type: Type = Field(description="A key indicating the format of the data.")


class RealityDataUpdate(RealityDataBase):
    itwin_id: Optional[str] = Field(None, description="Id of associated iTwin.")
    display_name: Optional[str] = Field(None, description="Name of the reality data.", alias="displayName")
    type: Optional[Type] = Field(None, description="A key indicating the format of the data.")


class ContainerType(Enum):
    AZURE_BLOB_SAS_URL = "AzureBlobSasUrl"


class Access(Enum):
    WRITE = "Write"
    READ = "Read"


class URL(BaseModel):
    href: str = Field(description="URL.")


class ContainerLinks(BaseModel):
    container_url: URL = Field(description="The URL of the container", alias="containerUrl")


class ContainerDetails(BaseModel):
    type: ContainerType = Field(description="Type of container.")
    access: Access = Field(description="Type of access user have to container.")
    links: ContainerLinks = Field(description="The link to the container.", alias="_links")


class Prefer(Enum):
    MINIMAL = "minimal"
    REPRESENTATION = "representation"


class RealityDataFilter(BaseModel):
    itwin_id: Optional[str] = Field(None, description="Id of iTwin. The operation gets all reality data in this iTwin.",
                                    alias="itwinId")
    continuation_token: Optional[str] = Field(None, alias="continuationToken",
                                              description="Parameter that enables continuing to the next page of the "
                                                          "previous paged query. This must be passed exactly as it is "
                                                          "in the response body's _links.next property. If this is "
                                                          "specified and $top is omitted, the next page will be the "
                                                          "same size as the previous page.")
    top: Optional[int] = Field(None, alias="$top", description="The number of reality data to get in each page.",
                               le=1000, ge=1)
    extent: Optional[Extent] = Field(None, description="Extent of the area to search, delimited by southwest and "
                                                       "northeast coordinates.")
    order_by: Optional[str] = Field(None, description="Parameter that enable to order reality data in ascending or "
                                                      "descending order. Default is ascending. Example: displayName "
                                                      "desc",
                                    alias="$orderBy")
    search: Optional[str] = Field(None, description="Search reality data.")
    types: Optional[list[Type]] = Field(None, description="List of reality data types.")
    acquisition_date_time: Optional[Tuple[datetime, datetime]] = Field(None, alias="acquisitionDateTime",
                                                                  description="Aquisition datetime range (start, end) "
                                                                              "in ISO-8601 compliant time (UTC).")
    created_date_time: Optional[Tuple[datetime, datetime]] = Field(None, alias="createdDateTime",
                                                                   description="Created datetime range (start, end) "
                                                                               "in ISO-8601 compliant time (UTC).")
    modified_date_time: Optional[Tuple[(datetime, datetime)]] = Field(None, alias="modifiedDateTime",
                                                                      description="Modified datetime "
                                                                                  "range (start, end) "
                                                                                  "in ISO-8601 compliant time (UTC).")
    last_accessed_date_time: Optional[Tuple[(datetime, datetime)]] = Field(None, alias="lastAccessedDateTime",
                                                                           description="Last accessed datetime "
                                                                                       "range (start, "
                                                                                       "end) in ISO-8601 "
                                                                                       "compliant time (UTC).")
    owner_id: Optional[str] = Field(None, description="Guid identifier of the owner.", alias="ownerId")
    data_center: Optional[str] = Field(None, description="Data center location.", alias="dataCenter")
    tag: Optional[str] = Field(None, description="Parameter to get reality data with exact matching tags.")

    def as_dict_for_service_call(self) -> dict:
        params = {k: v for k, v in self.model_dump(by_alias=True).items() if v is not None}

        for k in [key for key in params.keys() if key.endswith("DateTime")]:
            params[k] = f'{params[k][0].strftime("%Y-%m-%dT%H:%M:%SZ")}/{params[k][1].strftime("%Y-%m-%dT%H:%M:%SZ")}'

        return params


class RealityDataMinimal(BaseModel):
    id: str = Field(description="Identifier of the reality data. This identifier is assigned by the service at the "
                                "creation of the reality data. It is also unique.")
    display_name: str = Field(description="Name of the reality data.", alias="displayName")
    type: Type = Field(description="A key indicating the format of the data. The type property should be a specific "
                                   "indication of the format of the reality data.")


class NextPageLink(BaseModel):
    next: URL = Field(description="Link.")


class RealityDatas(BaseModel):
    reality_data: list[Union[RealityData, RealityDataMinimal]] = Field(description="List of reality data",
                                                                       alias="realityData")
    links: Optional[NextPageLink] = Field(None, description="Next page link.", alias="_links")


def get_continuation_token(rd: RealityDatas) -> Optional[str]:
    if not rd.links:
        return None
    parsed_url = urlparse(rd.links.next.href)
    query_params = parse_qs(parsed_url.query)
    continuation_token = query_params.get('continuationToken', [None])[0]
    return continuation_token
