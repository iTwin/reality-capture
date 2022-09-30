from enum import Enum
from typing import TypeVar, Generic


class RealityDataType(Enum):
    """
    Data types used in ProjectWise ContextShare
    """
    ImageCollection = "CCImageCollection"
    ContextScene = "ContextScene"
    ContextDetector = "ContextDetector"
    CCOrientations = "CCOrientations"
    ScanCollection = "ScanCollection"
    DGN = "DGN"
    SHP = "SHP"
    POD = "PointCloud"
    LAS = "LAS"
    LAZ = "LAZ"
    OPC = "OPC"
    PLY = "PLY"
    ThreeMX = "3MX"
    ThreeSM = "3SM"
    Cesium = "Cesium"
    Unstructured = "Unstructured"


T = TypeVar("T")


class ReturnValue(tuple, Generic[T]):
    """
    A tuple containing relevant data, and a potential error message

    When no error was encountered, the error message will be empty
    """
    value: T
    error: str

    def __new__(cls, value: T, error: str):
        self = tuple.__new__(cls, (value, error))
        self.value = value
        self.error = error
        return self

    def is_error(self) -> bool:
        """
        Checks whether this return value contains an error

        :return: True if the return value contains an error
        """
        return len(self.error) > 0
