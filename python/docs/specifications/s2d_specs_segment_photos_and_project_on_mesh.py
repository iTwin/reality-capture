import reality_capture.specifications.segmentation2d as segmentation2d

s2d = segmentation2d.Segmentation2DSpecificationsCreate()
s2d.inputs.photos = "401975b7-0c0a-4498-5896-84987921f4bb"
s2d.inputs.photo_segmentation_detector = "08342927-859c-4563-a4b8-6c6cfb7d5bb3"
s2d.inputs.meshes = "c6169435-0c50-7e79-b323-dfff4a499c60"
s2d.outputs = [segmentation2d.Segmentation2DOutputsCreate.SEGMENTATION2D,
               segmentation2d.Segmentation2DOutputsCreate.SEGMENTED_PHOTOS,
               segmentation2d.Segmentation2DOutputsCreate.LINES3D,
               segmentation2d.Segmentation2DOutputsCreate.POLYGONS3D]
