import reality_capture.specifications.training as training

s3d_inputs = training.TrainingS3DInputs(
    segmentations3D=["401975b7-0c0a-4498-5896-84987921f4bb"],
    detectorName="example-detector",
)

s3d_outputs = [
    training.TrainingS3DOutputsCreate.DETECTOR,
]
s3d_options = training.TrainingS3DOptions(epochs=2, spacing=0.2)

s3ds = training.TrainingS3DSpecificationsCreate(
    inputs=s3d_inputs, outputs=s3d_outputs, options=s3d_options
)
