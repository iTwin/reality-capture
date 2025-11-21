from reality_capture.specifications.gaussian_splats import (GaussianSplatsSpecificationsCreate, GSFormat,
                                                            GaussianSplatsInputs, GaussianSplatsOutputsCreate,
                                                            GaussianSplatsOptions)

inputs = GaussianSplatsInputs(scene="e3e12e4f-9fe0-4169-9571-41ecebd8c229")
outputs = [GaussianSplatsOutputsCreate.SPLATS]
options = GaussianSplatsOptions(exportFormat=GSFormat.THREED_TILES)

specs = GaussianSplatsSpecificationsCreate(inputs=inputs, outputs=outputs, options=options)
