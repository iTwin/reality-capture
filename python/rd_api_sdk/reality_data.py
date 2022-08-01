from typing import Optional, List
from enum import Enum
from datetime import datetime
from dateutil import parser


class Classification(str, Enum):
    """
    Classification of a reality data
    """
    TERRAIN = "Terrain"
    IMAGERY = "Imagery"
    PINNED = "Pinned"
    MODEL = "Model"
    UNDEFINED = "Undefined"
 
    @staticmethod
    def from_str(s: str):
        for x in Classification:
            if x == x.value:
                return x


class Visibility(str, Enum):
    """
    Visibility of a reality data
    """
    PUBLIC = "PUBLIC"
    ENTERPRISE = "ENTERPRISE"
    PERMISSION = "PERMISSION"
    PRIVATE = "PRIVATE"

    @staticmethod
    def from_str(s: str):
        for x in Visibility:
            if x == x.value:
                return x


class Coordinate:
    """
    Coordinate in latitude/longitude format
    """
    def __init__(self, lat: float, long: float):
        """
        Constructor

        :param lat: Latitude in numeric format (40.0654)
        :param long: Longitude in numeric format (-75.6877)
        """
        self._lat = lat
        self._long = long

    def lat(self) -> float:
        """
        :return: Latitude
        """
        return self._lat

    def long(self) -> float:
        """
        :return: Longitude
        """
        return self._long


class Extent:
    """
    Extent of a reality data
    """
    def __init__(self, southwest: Coordinate, northeast: Coordinate):
        self._sw = southwest
        self._ne = northeast

    def southwest(self, c: Optional[Coordinate] = None) -> Coordinate:
        """
        Southwest corner of the extent

        :param c: Optional Coordinate to replace the current value
        :return: Southwest coordinate of the extent
        """
        if c is not None:
            self._sw = c
        return self._sw

    def northeast(self, c: Optional[Coordinate] = None) -> Coordinate:
        """
        Northeast corner of the extent

        :param c: Optional Coordinate to replace the current value
        :return: Northeast coordinate of the extent
        """
        if c is not None:
            self._ne = c
        return self._ne


class Acquisition:
    """
    Details about data acquisition
    """

    def __init__(self, start_date_time: Optional[datetime] = None,
                 end_date_time: Optional[datetime] = None, acquirer: Optional[str] = None):
        """
        Constructor

        :param start_date_time: Optional acquisition start date time
        :param end_date_time: Optional acquisition end date time
        :param acquirer: Optional acquirer name
        """
        self._start_date = start_date_time
        self._end_date = end_date_time
        self._acquirer = acquirer

    def start_date(self) -> Optional[datetime]:
        """
        :return: Optional start date of the acquisition
        """
        return self._start_date

    def end_date(self) -> Optional[datetime]:
        """
        :return: Optional end date of the acquisition
        """
        return self._end_date

    def acquirer(self) -> Optional[str]:
        """
        :return: Optional acquirer
        """
        return self._acquirer


class RealityDataUpdate:
    def __init__(self, name: Optional[str] = None, classification: Optional[Classification] = None,
                 rd_type: Optional[str] = None, acquisition: Optional[Acquisition] = None,
                 description: Optional[str] = None, dataset: Optional[str] = None,
                 group: Optional[str] = None, root_doc: Optional[str] = None, extent: Optional[Extent] = None,
                 authoring: Optional[bool] = None):
        """
        Constructor

        :param name: Optional new reality data name
        :param classification: Optional new classification
        :param rd_type: Optional new reality data type
        :param acquisition: Optional new acquisition information
        :param description: Optional new description
        :param dataset: Optional new loose dataset grouping
        :param group: Optional new loose second level of grouping
        :param root_doc: Optional new root document of the reality data
        :param extent: Optional new extent of the reality data
        :param authoring: Optional new authoring status of the reality data
        """
        self._name = name
        self._classification = classification
        self._type = rd_type
        self._acquisition = acquisition
        self._description = description
        self._dataset = dataset
        self._group = group
        self._root_doc = root_doc
        self._extent = extent
        self._authoring = authoring

    def name(self) -> Optional[str]:
        return self._name

    def classification(self) -> Optional[Classification]:
        return self._classification

    def type(self) -> Optional[str]:
        return self._type

    def acquisition(self) -> Optional[Acquisition]:
        return self._acquisition

    def description(self) -> Optional[str]:
        return self._description

    def dataset(self) -> Optional[str]:
        return self._dataset

    def group(self) -> Optional[str]:
        return self._group

    def root_document(self) -> Optional[str]:
        return self._root_doc

    def extent(self) -> Optional[Extent]:
        return self._extent

    def authoring(self) -> Optional[bool]:
        return self._authoring


class RealityDataCreate(RealityDataUpdate):
    def __init__(self, name: str, classification: Classification, rd_type: str,
                 acquisition: Optional[Acquisition] = None,
                 description: Optional[str] = None, dataset: Optional[str] = None,
                 group: Optional[str] = None, root_doc: Optional[str] = None, extent: Optional[Extent] = None,
                 authoring: Optional[bool] = None):
        """
        Constructor

        :param name: Reality data name
        :param classification: Reality data classification
        :param rd_type: Reality data type
        :param acquisition: Reality data acquisition information (type is mandatory)
        :param description: Optional description
        :param dataset: Optional loose dataset grouping
        :param group: Optional loose second level of grouping
        :param root_doc: Optional root document of the reality data
        :param extent: Optional extent of the reality data
        :param authoring: Optional authoring status of the reality data
        """
        RealityDataUpdate.__init__(self, name, classification, rd_type, acquisition, description, dataset, group,
                                   root_doc, extent, authoring)

    def name(self) -> str:
        return self._name

    def classification(self) -> Classification:
        return self._classification

    def type(self) -> str:
        return self._type


class RealityData(RealityDataCreate):
    def __init__(self, rd_id: str, name: str, classification: Classification, rd_type: str,
                 modified_date_time_str: str, last_access_date_time_str: str, created_date_time_str: str,
                 datacenter: str,
                 acquisition: Optional[Acquisition],
                 description: Optional[str] = None, dataset: Optional[str] = None,
                 group: Optional[str] = None, root_doc: Optional[str] = None,
                 extent: Optional[Extent] = None, authoring: Optional[bool] = None):
        """
        Constructor

        :param rd_id: Reality data id
        :param name: Reality data name
        :param classification: Reality data classification
        :param rd_type: Reality data type
        :param modified_date_time_str: Last modified datetime as string
        :param last_access_date_time_str:  Last access datetime as string
        :param created_date_time_str: Created datetime as string
        :param datacenter: Datacenter location of the reality data
        :param acquisition: Reality data acquisition information
        :param description: Optional description
        :param dataset: Optional loose dataset grouping
        :param group: Optional loose second level of grouping
        :param root_doc: Optional root document of the reality data
        :param extent: Optional extent of the reality data
        :param authoring: Optional authoring status of the reality data
        """
        RealityDataCreate.__init__(self, name, classification, rd_type, acquisition, description, dataset, group,
                                   root_doc, extent, authoring)

        self._id = rd_id
        self._modified = parser.parse(modified_date_time_str)
        self._last_access = parser.parse(last_access_date_time_str)
        self._created = parser.parse(created_date_time_str)
        self._datacenter = datacenter

    def id(self) -> str:
        return self._id

    def modified(self) -> datetime:
        return self._modified

    def last_access(self) -> datetime:
        return self._last_access

    def created(self) -> datetime:
        return self._created

    def datacenter_location(self) -> str:
        return self._datacenter
