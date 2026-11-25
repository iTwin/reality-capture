from reality_capture.specifications.mesh_optimization import (
    MeshOptimizationFormat,
    MeshOptimizationInputs,
    MeshOptimizationOptions,
    MeshOptimizationSpecificationsCreate,
)

inputs = MeshOptimizationInputs(meshes=["dbad181b-5079-4224-8561-96ad218bcfc9"])
options = MeshOptimizationOptions(outputFormat=MeshOptimizationFormat.THREE_D_TILES_1_1)
specs = MeshOptimizationSpecificationsCreate(inputs=inputs, options=options)
