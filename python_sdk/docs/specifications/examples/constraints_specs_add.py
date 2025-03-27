import reality_capture.specifications.constraints as constraints

cta = constraints.ConstraintToAdd(constraintPath="0e9ef0f0-13a6-4cdc-b908-ab3db7ce2722/polygon.kml",
                                  crs="EPSG:4326",
                                  name="Lake constraints",
                                  type=constraints.ConstraintType.POLYGON)
cs_inputs = constraints.ConstraintsInputs(referenceModel="9f5c56df-ad21-4f9f-89ba-39a23b4ea058",
                                          constraintsToAdd=[cta])
cs_outputs = [constraints.ConstraintsOutputsCreate.ADDED_CONSTRAINTS_INFO]
cs = constraints.ConstraintsSpecificationsCreate(inputs=cs_inputs, outputs=cs_outputs)
