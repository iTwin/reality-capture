import reality_capture.specifications.import_point_cloud as ipc

ipc_inputs = ipc.ImportPCInputs(scene="366982d8-043a-4517-91e8-37ca72662b3a")
ipc_outputs = [ipc.ImportPCOutputsCreate.SCAN_COLLECTION,
               ipc.ImportPCOutputsCreate.SCAN_COLLECTION.SCENE]
ipcs = ipc.ImportPCSpecificationsCreate(inputs=ipc_inputs, outputs=ipc_outputs)
