import reality_capture.specifications.reconstruction as recons
import reality_capture.specifications.tiling as tiling
import reality_capture.specifications.production as prod

rs = recons.ReconstructionSpecificationsCreate()
rs.inputs.scene = ""
rs.inputs.region_of_interest = "/roi.json"
exp = prod.ExportCreate()
exp.format = prod.Format.THREED_TILES
rs.outputs = [tiling.TilingOutputsCreate.REFERENCE_MODEL, exp]
rs.options.geometric_precision = tiling.GeometricPrecision.HIGH
