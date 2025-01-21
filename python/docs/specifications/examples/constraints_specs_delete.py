import reality_capture.specifications.constraints as constraints

cs = constraints.ConstraintsSpecificationsCreate()
cs.inputs.reference_model = "9f5c56df-ad21-4f9f-89ba-39a23b4ea058"
cs.inputs.constraints_to_delete = ["d1e68e76-9fd4-48ba-a0ea-3c1f57d3dc9f"]
cs.outputs = [constraints.ConstraintsOutputsCreate.ADDED_CONSTRAINTS_INFO]
