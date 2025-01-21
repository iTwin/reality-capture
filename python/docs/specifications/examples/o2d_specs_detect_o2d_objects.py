import reality_capture.specifications.objects2d as objects2d

o2d = objects2d.Objects2DSpecificationsCreate()
o2d.inputs.photos = "401975b7-0c0a-4498-5896-84987921f4bb"
o2d.inputs.photo_object_detector = "08342927-859c-4563-a4b8-6c6cfb7d5bb3"
o2d.outputs = [objects2d.Objects2DOutputsCreate.OBJECTS2D]
