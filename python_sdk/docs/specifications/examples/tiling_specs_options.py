import reality_capture.specifications.tiling as tiling

tiling_inputs = tiling.TilingInputs(scene="401975b7-0c0a-4498-8896-84987921f4bb",
                                    regionOfInterest="bkt:roi.json")
tiling_outputs = [tiling.TilingOutputsCreate.MODELING_REFERENCE]
tiling_options = tiling.TilingOptions(refModelType=tiling.ModelingReferenceType.COMPLETE,
                                      discardEmptyTiles=False,
                                      geometricPrecision=tiling.GeometricPrecision.MEDIUM,
                                      tilingMode=tiling.TilingMode.ADAPTIVE)
tiling_options.tiling_value = 10  # 10GB adaptive tiling
tiling_specs = tiling.TilingSpecificationsCreate(inputs=tiling_inputs, outputs=tiling_outputs, options=tiling_options)
