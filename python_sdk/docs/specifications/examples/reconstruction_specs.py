import reality_capture.specifications.reconstruction as recons
import reality_capture.specifications.tiling as tiling
import reality_capture.specifications.production as prod

exp = prod.ExportCreate(format=prod.Format.THREED_TILES)
recons_inputs = recons.ReconstructionInputs(scene="5557540e-fe8a-4c9e-9b33-8ec648e158c0",
                                            regionOfInterest="bkt:roi.json")
recons_outputs = recons.ReconstructionOutputsCreate(modelingReference=True,
                                                    exports=[exp])
r_options = tiling.TilingOptions(geometricPrecision=tiling.GeometricPrecision.HIGH)
recons_specs = recons.ReconstructionSpecificationsCreate(inputs=recons_inputs,
                                                         outputs=recons_outputs, options=r_options)
