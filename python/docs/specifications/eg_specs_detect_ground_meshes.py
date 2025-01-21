import reality_capture.specifications.extract_ground as extract_ground

eg = extract_ground.ExtractGroundSpecificationsCreate()
eg.inputs.meshes = "279db84b-090f-4922-b9a5-7a4fd0a71fcd"
eg.inputs.point_cloud_segmentation_detector = "40af080d-7ata-48c8-974c-610820fe90f2"
eg.outputs = [extract_ground.ExtractGroundOutputsCreate.SEGMENTATION3D]
