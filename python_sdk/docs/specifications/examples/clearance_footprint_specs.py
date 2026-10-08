import reality_capture.specifications.clearance_footprint as clearance_footprint

cf_inputs = clearance_footprint.ClearanceFootprintInputs(segmentation3D="b75a8227-cac2-4e7e-b970-0e4c388681dd",
                                                         objects3D="b75a8227-cac2-4e7e-b970-0e4c388681dd")

cf_outputs = [clearance_footprint.ClearanceFootprintOutputsCreate.FOOTPRINTS]

clearance_footprint_specs = clearance_footprint.ClearanceFootprintSpecificationsCreate(inputs=cf_inputs,
                                                                                       outputs=cf_outputs)
