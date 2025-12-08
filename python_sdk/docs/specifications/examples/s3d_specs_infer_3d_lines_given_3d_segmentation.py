import reality_capture.specifications.segmentation3d as segmentation3d

s3d_inputs = segmentation3d.Segmentation3DInputs(segmentation3D="401975b7-0c0a-4498-5896-84987921f4bb")
s3d_outputs = [segmentation3d.Segmentation3DOutputsCreate.LINES3D]
s3d_options = segmentation3d.Segmentation3DOptions()
s3ds = segmentation3d.Segmentation3DSpecificationsCreate(inputs=s3d_inputs, outputs=s3d_outputs, options=s3d_options)
