import reality_capture.specifications.constraints as constraints

cta = constraints.ConstraintToAdd()
cta.constraint_path = "0e9ef0f0-13a6-4cdc-b908-ab3db7ce2722/polygon.kml"
cta.srs = "EPSG:4326"
cta.name = "Lake constraints"
cta.type = constraints.ConstraintType.POLYGON

cs = constraints.ConstraintsSpecificationsCreate()
cs.inputs.reference_model = "9f5c56df-ad21-4f9f-89ba-39a23b4ea058"
cs.inputs.constraints_to_add = [cta]
cs.outputs = [constraints.ConstraintsOutputsCreate.ADDED_CONSTRAINTS_INFO]
