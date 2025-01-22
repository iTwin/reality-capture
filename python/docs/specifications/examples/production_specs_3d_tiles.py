import reality_capture.specifications.production as production

exp_3d_tiles_options = production.Options3DTiles(compress=production.CesiumCompression.DRACO,
                                                 lod_scope=production.LODScope.ACROSS_TILES)
exp_3d_tiles = production.ExportCreate(format=production.Format.THREED_TILES, options=exp_3d_tiles_options)

exp_raster_options = production.OptionsOrthoDSM(orthoFormat=production.OrthoFormat.GEOTIFF,
                                                noDataTransparency=True,
                                                dsmFormat=production.DSMFormat.GEOTIFF,
                                                noDataValue=-5000)
exp_raster = production.ExportCreate(format=production.Format.ORTHOPHOTO_DSM, options=exp_raster_options)


p_inputs = production.ProductionInputs(scene="19ba3a13-69f5-43b6-8a48-5aacf6f366b9",
                                       referenceModel="3d5f3996-8cba-411f-b50f-85d4bd9e77a3")
p_outputs = production.ProductionOutputsCreate(exports=[exp_3d_tiles, exp_raster])
ps = production.ProductionSpecificationsCreate(inputs=p_inputs, outputs=p_outputs)
