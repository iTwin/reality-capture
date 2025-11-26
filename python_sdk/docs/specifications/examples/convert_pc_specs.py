from reality_capture.specifications.point_cloud_conversion import (PCConversionInputs, PCConversionOutputsCreate,
                                                                   PointCloudConversionSpecificationsCreate)

inputs = PCConversionInputs(pointClouds=["9655ff27-62fa-4af7-bfb8-d8f9481acdfc"])
outputs = PCConversionOutputsCreate.PNTS
conversion = PointCloudConversionSpecificationsCreate(inputs=inputs, outputs=outputs)
