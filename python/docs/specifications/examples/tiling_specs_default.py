import reality_capture.specifications.tiling as tiling

ts_inputs = tiling.TilingInputs(scene="401975b7-0c0a-4498-8896-84987921f4bb")
ts_outputs = [tiling.TilingOutputsCreate.REFERENCE_MODEL]
ts_options = tiling.TilingOptions()
ts = tiling.TilingSpecificationsCreate(inputs=ts_inputs, outputs=ts_outputs, options=ts_options)
