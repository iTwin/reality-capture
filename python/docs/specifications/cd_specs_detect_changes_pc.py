import reality_capture.specifications.change_detection as change_detection

cd = change_detection.ChangeDetectionSpecificationsCreate()
cd.inputs.point_clouds1 = "401975b7-0c0a-4498-5896-84987921f4bb"
cd.inputs.point_clouds2 = "08342927-859c-4563-a4b8-6c6cfb7d5bb3"
cd.outputs = [change_detection.ChangeDetectionOutputsCreate.OBJECTS3D]