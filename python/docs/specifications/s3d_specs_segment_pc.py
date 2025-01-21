import reality_capture.specifications.segmentation3d as segmentation3d

s3d = segmentation3d.Segmentation3DSpecificationsCreate()
s3d.inputs.point_clouds = "401975b7-0c0a-4498-5896-84987921f4bb"
s3d.inputs.point_cloud_segmentation_detector = "08342927-859c-4563-a4b8-6c6cfb7d5bb3"
s3d.outputs = [segmentation3d.Segmentation3DOutputsCreate.SEGMENTATION3D,
               segmentation3d.Segmentation3DOutputsCreate.SEGMENTED_POINT_CLOUD]