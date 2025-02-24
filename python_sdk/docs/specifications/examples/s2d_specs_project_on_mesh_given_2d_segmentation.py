import reality_capture.specifications.segmentation2d as segmentation2d

s2d_inputs = segmentation2d.Segmentation2DInputs(photos="401975b7-0c0a-4498-5896-84987921f4bb",
                                                 segmentation2D="a5dda9bf-d682-4325-baac-44cb80f2601f",
                                                 meshes="c6169435-0c50-7e79-b323-dfff4a499c60")
s2d_outputs = [segmentation2d.Segmentation2DOutputsCreate.LINES3D,
               segmentation2d.Segmentation2DOutputsCreate.POLYGONS3D]
s2d_options = segmentation2d.Segmentation2DOptions()
s2ds = segmentation2d.Segmentation2DSpecificationsCreate(inputs=s2d_inputs, outputs=s2d_outputs, options=s2d_options)
