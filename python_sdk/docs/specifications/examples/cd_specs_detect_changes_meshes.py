import reality_capture.specifications.change_detection as change_detection

cd_inputs = change_detection.ChangeDetectionInputs(model3DA="279db84b-090f-4922-b9a5-7a4fd0a71fcd",
                                                   model3DB="40af080d-7ata-48c8-974c-610820fe90f2")
cd_outputs = [change_detection.ChangeDetectionOutputsCreate.LOCATIONS3D_AS_GEOJSON]
cd_options = change_detection.ChangeDetectionOptions()
cds = change_detection.ChangeDetectionSpecificationsCreate(inputs=cd_inputs, outputs=cd_outputs, options=cd_options)
