from reality_capture.specifications.point_cloud_optimization import (PCOptimizationSpecificationsCreate,
                                                                     PCOptimizationFormat, PCOptimizationInputs,
                                                                     PCOptimizationOptions)

inputs = PCOptimizationInputs(pointClouds=["dbad181b-5079-4224-8561-96ad218bcfc9",
                                           "ea881e3e-b0e3-4b23-bc3f-4ee8e9acdf61"])
options = PCOptimizationOptions(outputFormat=PCOptimizationFormat.THREE_D_TILES_GLBC)

specs = PCOptimizationSpecificationsCreate(inputs=inputs, options=options)
