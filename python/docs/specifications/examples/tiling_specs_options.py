import reality_capture.specifications.tiling as tiling

ts = tiling.TilingSpecificationsCreate()
ts.inputs.scene = "401975b7-0c0a-4498-8896-84987921f4bb"
ts.inputs.region_of_interest = "2b09cefa-4795-422f-8533-75e3f423f96f/roi.json"  # See Region of Interest
ts.outputs = [tiling.TilingOutputsCreate.REFERENCE_MODEL]
ts.options.ref_model_type = tiling.ReferenceModelType.COMPLETE
ts.options.discard_empty_tiles = False
ts.options.geometric_precision = tiling.GeometricPrecision.MEDIUM
ts.options.tiling_mode = tiling.TilingMode.ADAPTIVE
ts.options.tiling_value = 10  # 10GB adaptive tiling
