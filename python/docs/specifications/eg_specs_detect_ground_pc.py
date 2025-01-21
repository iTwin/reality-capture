import reality_capture.specifications.extract_ground as extract_ground

eg = extract_ground.ExtractGroundSpecificationsCreate()
eg.inputs.point_clouds = "9e029e5b-8e97-4a36-97ee-5f997a48a5df"
eg.inputs.point_cloud_segmentation_detector = "40af080d-7ata-48c8-974c-610820fe90f2"
eg.outputs = [extract_ground.ExtractGroundOutputsCreate.SEGMENTATION3D]
