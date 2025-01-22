import reality_capture.specifications.objects2d as objects2d

o2d_inputs = objects2d.Objects2DInputs(photos="401975b7-0c0a-4498-5896-84987921f4bb",
                                       photoObjectDetector="08342927-859c-4563-a4b8-6c6cfb7d5bb3")
o2d_outputs = [objects2d.Objects2DOutputsCreate.OBJECTS2D]
o2d_options = objects2d.Objects2DOptions()
o2ds = objects2d.Objects2DSpecificationsCreate(inputs=o2d_inputs, outputs=o2d_outputs, options=o2d_options)

