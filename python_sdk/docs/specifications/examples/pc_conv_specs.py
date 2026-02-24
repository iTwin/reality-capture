from reality_capture.specifications.point_cloud_conversion import (PointCloudConversionSpecificationsCreate,
                                                                   PCConversionInputs, PCConversionOptions,
                                                                   PCConversionFormat)

inputs = PCConversionInputs(pointCloud="e3e12e4f-9fe0-4169-9571-41ecebd8c229")
options = PCConversionOptions(format=PCConversionFormat.LAS)

specs = PointCloudConversionSpecificationsCreate(inputs=inputs, options=options)
