import reality_capture.specifications.constraints as constraints

cs_inputs = constraints.ConstraintsInputs(referenceModel="9f5c56df-ad21-4f9f-89ba-39a23b4ea058",
                                          constraintsToDelete=["d1e68e76-9fd4-48ba-a0ea-3c1f57d3dc9f"])
cs_outputs = [constraints.ConstraintsOutputsCreate.ADDED_CONSTRAINTS_INFO]
cs = constraints.ConstraintsSpecificationsCreate(inputs=cs_inputs, outputs=cs_outputs)
