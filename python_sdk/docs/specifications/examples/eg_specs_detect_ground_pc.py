import reality_capture.specifications.extract_ground as extract_ground

eg_inputs = extract_ground.ExtractGroundInputs(pointClouds="9e029e5b-8e97-4a36-97ee-5f997a48a5df",
                                               pointCloudSegmentationDetector="40af080d-7ata-48c8-974c-610820fe90f2")
eg_outputs = [extract_ground.ExtractGroundOutputsCreate.SEGMENTATION3D]
eg_options = extract_ground.ExtractGroundOptions()
egs = extract_ground.ExtractGroundSpecificationsCreate(inputs=eg_inputs, outputs=eg_outputs, options=eg_options)
