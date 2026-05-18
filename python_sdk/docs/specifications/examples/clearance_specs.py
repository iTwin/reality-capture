import reality_capture.specifications.clearance as clearance

clearance_inputs = clearance.ClearanceInputs(model3d="084985b0-71b5-4b02-a788-db261dd0730c",
                                             clearanceFootprint="635f801b-82cc-4477-8d59-f01eb2fea1d9")
clearance_outputs = [clearance.ClearanceOutputsCreate.OVF_AREAS, clearance.ClearanceOutputsCreate.OVF_LINES]
clearance_specs =  clearance.ClearanceSpecificationsCreate(inputs=clearance_inputs, outputs=clearance_outputs)