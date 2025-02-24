import reality_capture.specifications.tiling as tiling

tiling_inputs = tiling.TilingInputs(scene="401975b7-0c0a-4498-8896-84987921f4bb",
                                    regionOfInterest="2b09cefa-4795-422f-8533-75e3f423f96f/roi.json")
tiling_outputs = [tiling.TilingOutputsCreate.REFERENCE_MODEL]
tiling_options = tiling.TilingOptions(refModelType=tiling.ReferenceModelType.COMPLETE,
                                      discardEmptyTiles=False,
                                      geometricPrecision=tiling.GeometricPrecision.MEDIUM,
                                      tilingMode=tiling.TilingMode.ADAPTIVE)
tiling_options.tiling_value = 10  # 10GB adaptive tiling
tiling_specs = tiling.TilingSpecificationsCreate(inputs=tiling_inputs, outputs=tiling_outputs, options=tiling_options)
