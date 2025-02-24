import reality_capture.specifications.change_detection as change_detection

cd_inputs = change_detection.ChangeDetectionInputs(pointClouds1="401975b7-0c0a-4498-5896-84987921f4bb",
                                                   pointClouds2="08342927-859c-4563-a4b8-6c6cfb7d5bb3")
cd_outputs = [change_detection.ChangeDetectionOutputsCreate.OBJECTS3D]
cd_options = change_detection.ChangeDetectionOptions()
cds = change_detection.ChangeDetectionSpecificationsCreate(inputs=cd_inputs, outputs=cd_outputs, options=cd_options)
