import reality_capture.specifications.extract_ground as extract_ground

eg_inputs = extract_ground.ExtractGroundInputs(meshes="279db84b-090f-4922-b9a5-7a4fd0a71fcd",
                                               pointCloudSegmentationDetector="40af080d-7ata-48c8-974c-610820fe90f2")
eg_outputs = [extract_ground.ExtractGroundOutputsCreate.SEGMENTATION3D]
eg_options = extract_ground.ExtractGroundOptions()
egs = extract_ground.ExtractGroundSpecificationsCreate(inputs=eg_inputs, outputs=eg_outputs, options=eg_options)
