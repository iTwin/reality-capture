import reality_capture.specifications.objects2d as objects2d

o2d = objects2d.Objects2DSpecificationsCreate()
o2d.inputs.photos = "587a14fd-305a-474c-b037-26d4ee8829d9" # oriented photos
o2d.inputs.objects2d = "63376f37-6ud5-466b-b361-9fc3623125f8"
o2d.outputs = [objects2d.Objects2DOutputsCreate.OBJECTS3D]