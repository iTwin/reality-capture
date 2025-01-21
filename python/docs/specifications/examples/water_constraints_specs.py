import reality_capture.specifications.water_constraints as wc

wcs = wc.WaterConstraintsSpecificationsCreate()
wcs.inputs.reference_model = "4f7331f3-e8eb-4e24-95d4-dd900b4718b1"
wcs.inputs.scene = "bacfb16f-da4a-4210-9ef5-a0b93ed78e66"
wcs.outputs = [wc.WaterConstraintsOutputsCreate.CONSTRAINTS]
wcs.options.force_horizontal = True
