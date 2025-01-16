import reality_capture.specifications.tiling as tiling

ts = tiling.TilingSpecificationsCreate()
ts.inputs.scene = "401975b7-0c0a-4498-8896-84987921f4bb"
ts.outputs = [tiling.TilingOutputsCreate.REFERENCE_MODEL]
ts.options.ref_model_type = tiling.ReferenceModelType.COMPLETE
ts.options.discard_empty_tiles = False
ts.options.geometric_precision = tiling.GeometricPrecision.MEDIUM
ts.options.tiling_mode = tiling.TilingMode.ADAPTIVE
ts.options.tiling_value = 10  # 10GB adaptive tiling
