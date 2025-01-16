import reality_capture.specifications.tiling as tiling

ts = tiling.TilingSpecificationsCreate()
ts.inputs.scene = "401975b7-0c0a-4498-8896-84987921f4bb"
ts.outputs = [tiling.TilingOutputsCreate.REFERENCE_MODEL]
