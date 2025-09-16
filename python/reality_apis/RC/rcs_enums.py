# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

from enum import Enum


class RCJobType(Enum):
    """
    Possible types of Reality Conversion job.
    """
    CONVERSION = "Conversion"
    IMPORT_FEATURES = "ImportFeatures"
    NONE = "not recognized"

class XYZTileFormat(Enum):
    """
    Possible formats for XYZTileMap.
    """
    JPG = "JPG"
    PNG = "PNG"