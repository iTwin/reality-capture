import reality_capture.specifications.segmentation3d as segmentation3d

s3d = segmentation3d.Segmentation3DSpecificationsCreate()
s3d.inputs.segmentation3d = "401975b7-0c0a-4498-5896-84987921f4bb"
s3d.outputs = [segmentation3d.Segmentation3DOutputsCreate.LINES3D]
