import reality_capture.specifications.production as production

exp_3d_tiles = production.ExportCreate()
exp_3d_tiles.format = production.Format.THREED_TILES
exp_3d_tiles.options = production.Options3DTiles()
exp_3d_tiles.options.compress = production.CesiumCompression.DRACO
exp_3d_tiles.options.lod_scope = production.LODScope.ACROSS_TILES

exp_raster = production.ExportCreate()
exp_raster.format = production.Format.ORTHOPHOTO_DSM
exp_raster.options = production.OptionsOrthoDSM()
exp_raster.options.ortho_format = production.OrthoFormat.GEOTIFF
exp_raster.options.no_data_transparency = True
exp_raster.options.dsm_format = production.DSMFormat.GEOTIFF
exp_raster.options.no_data_value = -5000

ps = production.ProductionSpecificationsCreate()
ps.inputs.scene = "19ba3a13-69f5-43b6-8a48-5aacf6f366b9"
ps.inputs.reference_model = "3d5f3996-8cba-411f-b50f-85d4bd9e77a3"
ps.outputs.exports = [exp_3d_tiles, exp_raster]
