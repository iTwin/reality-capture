import reality_capture.specifications.change_detection as change_detection

cd = change_detection.ChangeDetectionSpecificationsCreate()
cd.inputs.meshes1 = "279db84b-090f-4922-b9a5-7a4fd0a71fcd"
cd.inputs.meshes2 = "40af080d-7ata-48c8-974c-610820fe90f2"
cd.outputs = [change_detection.ChangeDetectionOutputsCreate.OBJECTS3D]