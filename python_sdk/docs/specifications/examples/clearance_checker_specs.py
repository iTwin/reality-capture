import reality_capture.specifications.clearance_checker as clearance_checker

cc_inputs = clearance_checker.ClearanceCheckerInputs(model3D="b75a8227-cac2-4e7e-b970-0e4c388681dd",
                                                     footprints="b75a8227-cac2-4e7e-b970-0e4c388681dd")

cc_outputs = [clearance_checker.ClearanceCheckerOutputsCreate.CLEARANCE]

clearance_footprint_specs = clearance_checker.ClearanceCheckerSpecificationsCreate(inputs=cc_inputs, outputs=cc_outputs)
