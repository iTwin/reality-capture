import reality_capture.specifications.water_constraints as wc

wc_inputs = wc.WaterConstraintsInputs(modelingReference="4f7331f3-e8eb-4e24-95d4-dd900b4718b1",
                                      scene="bacfb16f-da4a-4210-9ef5-a0b93ed78e66")
wc_outputs = [wc.WaterConstraintsOutputsCreate.CONSTRAINTS]
wc_options = wc.WaterConstraintsOptions(forceHorizontal=True)
wcs = wc.WaterConstraintsSpecificationsCreate(inputs=wc_inputs, outputs=wc_outputs, options=wc_options)
