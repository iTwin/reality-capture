import reality_capture.specifications.objects2d as objects2d

o2d = objects2d.Objects2DSpecificationsCreate()
o2d.inputs.photos = "587a14fd-305a-474c-b037-26d4ee8829d9" # oriented photos
o2d.inputs.photo_object_detector = "08342927-859c-4563-a4b8-6c6cfb7d5bb3"
o2d.outputs = [objects2d.Objects2DOutputsCreate.OBJECTS2D, objects2d.Objects2DOutputsCreate.OBJECTS3D]