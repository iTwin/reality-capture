import reality_capture.specifications.reconstruction as recons
import reality_capture.specifications.tiling as tiling
import reality_capture.specifications.production as prod

exp = prod.ExportCreate(format=prod.Format.THREED_TILES)
r_inputs = recons.ReconstructionInputs(scene="5557540e-fe8a-4c9e-9b33-8ec648e158c0",
                                       regionOfInterest="a5dda9bf-d682-4325-baac-44cb80f2601f")
r_outputs = [tiling.TilingOutputsCreate.REFERENCE_MODEL, exp]
r_options = tiling.TilingOptions(geometricPrecision=tiling.GeometricPrecision.HIGH)
rs = recons.ReconstructionSpecificationsCreate(inputs=r_inputs, outputs=r_outputs, options=r_options)

