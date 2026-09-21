from reality_capture.specifications.mesh_sampling import (MeshSamplingSpecificationsCreate, MeshSamplingInputs,
                                                          MeshSamplingOptions, MeshSamplingFormat)

inputs = MeshSamplingInputs(meshes=["dbad181b-5079-4224-8561-96ad218bcfc9", "ea881e3e-b0e3-4b23-bc3f-4ee8e9acdf61"])
options = MeshSamplingOptions(outputFormat=MeshSamplingFormat.THREE_D_TILES_GLBC)

specs = MeshSamplingSpecificationsCreate(inputs=inputs, options=options)
