# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

from enum import Enum


class RDAJobType(Enum):
    """
    Possible types of a job.
    """

    NONE = "not recognized"
    O2D = "objects2D"
    S2D = "segmentation2D"
    SOrtho = "segmentationOrthophoto"
    S3D = "segmentation3D"
    ChangeDetection = "changeDetection"
    ExtractGround = "extractGround"
    EvalS2D = "evalS2D"
    EvalS3D = "evalS3D"
    EvalSOrtho = "evalSOrtho"
    EvalO2D = "evalO2d"
    EvalO3D = "evalO3d"
