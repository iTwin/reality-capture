import reality_capture.specifications.change_detection as change_detection

cd_inputs = change_detection.ChangeDetectionInputs(model3dA="279db84b-090f-4922-b9a5-7a4fd0a71fcd",
                                                   model3dB="40af080d-7ata-48c8-974c-610820fe90f2")
cd_outputs = [change_detection.ChangeDetectionOutputsCreate.OBJECTS3D]
cd_options = change_detection.ChangeDetectionOptions()
cds = change_detection.ChangeDetectionSpecificationsCreate(inputs=cd_inputs, outputs=cd_outputs, options=cd_options)
