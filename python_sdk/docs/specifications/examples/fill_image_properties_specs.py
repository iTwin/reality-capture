import reality_capture.specifications.fill_image_properties as fip

fip_inputs = fip.FillImagePropertiesInputs(imageCollections=["fad5be03-30ee-4801-90e0-dee0349e5bce",
                                                             "e1cbd494-8e62-4004-89f9-8776aea1af50"])
fip_outputs = [fip.FillImagePropertiesOutputsCreate.SCENE]
fip_options = fip.FillImagePropertiesOptions(altitudeReference=fip.AltitudeReference.SEA_LEVEL)
fips = fip.FillImagePropertiesSpecificationsCreate(inputs=fip_inputs, outputs=fip_outputs, options=fip_options)
