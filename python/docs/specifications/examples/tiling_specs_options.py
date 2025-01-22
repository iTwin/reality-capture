import reality_capture.specifications.tiling as tiling

ts_inputs = tiling.TilingInputs(scene="401975b7-0c0a-4498-8896-84987921f4bb",
                                regionOfInterest="2b09cefa-4795-422f-8533-75e3f423f96f/roi.json")
ts_outputs = [tiling.TilingOutputsCreate.REFERENCE_MODEL]
ts_options = tiling.TilingOptions(refModelType=tiling.ReferenceModelType.COMPLETE,
                                  discardEmptyTiles=False,
                                  geometricPrecision=tiling.GeometricPrecision.MEDIUM,
                                  tilingMode=tiling.TilingMode.ADAPTIVE)
ts_options.tiling_value = 10  # 10GB adaptive tiling
ts = tiling.TilingSpecificationsCreate(inputs=ts_inputs, outputs=ts_outputs, options=ts_options)
