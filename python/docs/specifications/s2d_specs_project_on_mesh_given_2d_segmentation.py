import reality_capture.specifications.segmentation2d as segmentation2d

s2d = segmentation2d.Segmentation2DSpecificationsCreate()
s2d.inputs.photos = "401975b7-0c0a-4498-5896-84987921f4bb"
s2d.inputs.segmentation2d = "a5dda9bf-d682-4325-baac-44cb80f2601f"
s2d.inputs.meshes = "c6169435-0c50-7e79-b323-dfff4a499c60"
s2d.outputs = [segmentation2d.Segmentation2DOutputsCreate.LINES3D,
               segmentation2d.Segmentation2DOutputsCreate.POLYGONS3D]